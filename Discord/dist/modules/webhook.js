"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.notionDBAutomationWebHook = void 0;
const notionUtils_1 = require("../utils/notionUtils");
const DEBOUNCE_TIME = 10_000;
const debounceMap = new Map();
const typeHandlers = {
    title: (prop) => prop.title?.map((t) => t.plain_text).join('') || '—',
    rich_text: (prop) => prop.rich_text?.map((t) => t.plain_text).join('') || '—',
    select: (prop) => prop.select?.name || '—',
    date: (prop) => prop.date?.start || '—',
    number: (prop) => prop.number?.toString() || '—',
    email: (prop) => prop.email || '—',
    phone_number: (prop) => prop.phone_number || '—',
    url: (prop) => prop.url || '—',
    status: (prop) => prop.status?.name || '—',
    people: (prop) => prop.people?.map((p) => p.name || `<@${p.id}>`).join(', ') || '—',
    relation: (prop) => prop.relation?.map((r) => r.id).join(', ') || '—',
};
const getPropValue = (prop) => {
    if (!prop?.type)
        return '—';
    return typeHandlers[prop.type]?.(prop) || '—';
};
const extractPageTitle = async (pageId) => {
    const page = await (0, notionUtils_1.getNotionPage)(pageId);
    const titleProp = Object.values(page.properties).find((p) => p.type === 'title');
    return titleProp?.title?.[0]?.plain_text || 'Untitled';
};
const padDescription = (desc, minLength = 80) => {
    if (desc.length >= minLength)
        return desc;
    return desc + ' '.repeat(minLength - desc.length);
};
const wrapContent = async (data) => {
    const props = data.properties || {};
    const author = await (0, notionUtils_1.fetchNotionUser)(data.last_edited_by?.id) || 'Someone';
    const action = data.created_time === data.last_edited_time ? 'created a new task' : 'updated a task';
    const embedFields = [];
    const usedTypes = new Set();
    const findField = (type, names = []) => {
        for (const [key, prop] of Object.entries(props)) {
            if (prop?.type === type) {
                if (names.length === 0 || names.some((n) => key.toLowerCase().includes(n.toLowerCase()))) {
                    return [key, prop];
                }
            }
        }
        for (const [key, prop] of Object.entries(props)) {
            if (prop?.type === type && !usedTypes.has(key)) {
                return [key, prop];
            }
        }
        return null;
    };
    const priority = findField('select', ['priority']);
    const status = findField('status', ['status']);
    const assignee = findField('people', ['assignee']);
    const projectRelation = findField('relation', ['project']);
    const descriptionField = findField('rich_text', ['description', 'summary']);
    const pushIfFound = (entry) => {
        if (!entry)
            return;
        const [key, prop] = entry;
        embedFields.push({
            name: key,
            value: getPropValue(prop),
            inline: true,
        });
        usedTypes.add(key);
    };
    pushIfFound(priority);
    pushIfFound(assignee);
    pushIfFound(status);
    if (projectRelation) {
        const [key, prop] = projectRelation;
        const relationIds = prop.relation?.map((r) => r.id) || [];
        const projectNames = await Promise.all(relationIds.map(extractPageTitle));
        embedFields.push({
            name: key,
            value: projectNames.join(', ') || '—',
            inline: true,
        });
    }
    const description = descriptionField ? getPropValue(descriptionField[1]) : '—';
    const extractTitleFromProps = (props) => {
        const titleProp = Object.values(props).find((p) => p.type === 'title');
        return titleProp?.title?.[0]?.plain_text || 'Untitled';
    };
    return {
        author: {
            name: `${author.name} ${action}`,
            icon_url: author.avatar_url || undefined,
        },
        title: extractTitleFromProps(data.properties),
        url: data.url,
        description: padDescription(description),
        fields: embedFields,
        color: 0x5865f2,
        timestamp: new Date().toISOString(),
    };
};
async function sendMessageToChannel(channelId, data) {
    const url = `https://discord.com/api/v10/channels/${channelId}/messages`;
    if (!data || !data.properties || !data.url)
        return;
    const embed = await wrapContent(data);
    const response = await fetch(url, {
        method: 'POST',
        headers: {
            'Authorization': `Bot ${process.env.DISCORD_TOKEN}`,
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            embeds: [embed],
            components: [
                {
                    type: 1,
                    components: [
                        {
                            type: 2,
                            label: 'Comment',
                            style: 1,
                            custom_id: `add_comment_${data.id}`,
                        },
                    ],
                },
            ],
        }),
    });
    if (!response.ok) {
        const error = await response.json();
        console.error('❌ Failed to send message:', error);
    }
    else {
        console.log('✅ Message sent to Discord!');
    }
}
const notionDBAutomationWebHook = async (req, res) => {
    const { channelId } = req.params;
    const { source, data } = req.body;
    console.log(JSON.stringify(req.body));
    const key = `${source.automation_id}:${data.id}`;
    if (debounceMap.has(key)) {
        clearTimeout(debounceMap.get(key).timeout);
    }
    const timeout = setTimeout(() => {
        sendMessageToChannel(channelId, debounceMap.get(key).latestData);
        debounceMap.delete(key);
    }, DEBOUNCE_TIME);
    debounceMap.set(key, {
        timeout,
        latestData: data,
    });
    res.status(200).send({ received: true });
};
exports.notionDBAutomationWebHook = notionDBAutomationWebHook;
