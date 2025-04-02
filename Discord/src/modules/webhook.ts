import { fetchNotionUser, getNotionPage, getComments } from '../utils/notionUtils';

const DEBOUNCE_TIME = 10_000;
const debounceMap = new Map();

const typeHandlers: Record<string, (prop: any) => string> = {
    title: (prop) => prop.title?.map((t: any) => t.plain_text).join('') || '—',
    rich_text: (prop) => prop.rich_text?.map((t: any) => t.plain_text).join('') || '—',
    select: (prop) => prop.select?.name || '—',
    date: (prop) => prop.date?.start || '—',
    number: (prop) => prop.number?.toString() || '—',
    email: (prop) => prop.email || '—',
    phone_number: (prop) => prop.phone_number || '—',
    url: (prop) => prop.url || '—',
    status: (prop) => prop.status?.name || '—',
    people: (prop) => prop.people?.map((p: any) => p.name || `<@${p.id}>`).join(', ') || '—',
    relation: (prop) => prop.relation?.map((r: any) => r.id).join(', ') || '—',
};

const getPropValue = (prop: any): string => {
    if (!prop?.type) return '—';
    return typeHandlers[prop.type]?.(prop) || '—';
};

const extractPageTitle = async (pageId: string): Promise<string> => {
    const page = await getNotionPage(pageId);
    const titleProp = Object.values((page as any).properties).find((p: any) => p.type === 'title') as any;
    return titleProp?.title?.[0]?.plain_text || 'Untitled';
};

const wrapContent = async (data: any) => {
    const props = data.properties || {};
    const author = await fetchNotionUser(data.last_edited_by?.id) || 'Someone';
    const action = data.created_time === data.last_edited_time ? 'new ticket' : 'updated a ticket';

    const embedFields: { name: string; value: string; inline: boolean }[] = [];
    const usedTypes: Set<string> = new Set();

    const findField = (type: string, names: string[] = []): [string, any] | null => {
        for (const [key, prop] of Object.entries(props)) {
            if ((prop as any)?.type === type) {
                if (names.length === 0 || names.some((n) => key.toLowerCase().includes(n.toLowerCase()))) {
                    return [key, prop];
                }
            }
        }
        for (const [key, prop] of Object.entries(props)) {
            if ((prop as any)?.type === type && !usedTypes.has(key)) {
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

    const pushIfFound = (entry: [string, any] | null) => {
        if (!entry) return;
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
        const relationIds = prop.relation?.map((r: any) => r.id) || [];
        const projectNames = await Promise.all(relationIds.map(extractPageTitle));

        embedFields.push({
            name: key,
            value: projectNames.join(', ') || '—',
            inline: true,
        });
    }

    const description = descriptionField ? getPropValue(descriptionField[1]) : '—';

    const extractTitleFromProps = (props: any): string => {
        const titleProp = Object.values(props).find((p: any) => p.type === 'title') as any;
        return titleProp?.title?.[0]?.plain_text || 'Untitled';
    };

    const commentsList = await getComments(data.id);
    const commentCount = commentsList.results.length;

    return {
        author: {
            name: `${author.name} ${action}`,
            icon_url: author.avatar_url || undefined,
        },
        title: extractTitleFromProps(data.properties),
        url: data.url,
        description: description,
        fields: embedFields,
        color: 0x5865f2,
        timestamp: new Date().toISOString(),
        footer: {
            text: `💬 ${commentCount}`,
        },
    };
};

async function sendMessageToChannel(channelId: string, data: any) {
    try {
        const url = `https://discord.com/api/v10/channels/${channelId}/messages`;
        if (!data || !data.properties || !data.url) return;

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
                        type: 1, // Action row
                        components: [
                            {
                                type: 2, // Button
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
        } else {
            console.log('✅ Message sent to Discord!');
        }
    } catch (error) {
        console.error('❌ Error in sendMessageToChannel:', error);
    }
}

export const notionDBAutomationWebHook = async (req: any, res: any) => {
    try {
        const { channelId } = req.params;
        const { source, data } = req.body;
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
    } catch (error) {
        console.error('❌ Error in notionDBAutomationWebHook:', error);
    } finally {
        res.status(200).send({ received: true });
    }
};
