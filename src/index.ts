import { makeBadge } from 'badge-maker';
import { siModrinth } from 'simple-icons';
import { Elysia, t } from 'elysia';
import { cors } from '@elysiajs/cors';
import { openapi } from '@elysiajs/openapi';
import type { ModrinthAPIResponse, ModrinthAPIVersionsResponse } from './types';
import { getMinecraftVersions } from './getMinecraftVersions';
import { EnvManager } from 'managedenv';

const app = new Elysia();

// If using Docker, use port 3000 and map port 3000 from docker to whichever port you want to use on your host
// e.g. 3001:3000
const envs = new EnvManager()
    .add({
        name: "PORT",
        default: 3000,
        required: true,
        type: Number
    }).load();

const port = envs.env.PORT;

app.use(cors());
app.use(openapi({
    documentation: {
        info: {
            title: 'Modrinth Badges API',
            description: 'An API to generate badges for Modrinth projects, such as supported Minecraft versions. Not affiliated with Modrinth, Shields.io or Mojang in any way.',
            version: '1.1.0'
        }
    }
}));

// Preload cache
getMinecraftVersions();

app.get(
    '/',
    ({ set }) => {
        set.status = 307;
        set.headers['Location'] = '/openapi';
        return 'Redirecting...';
    },
    {
        detail: {
            tags: ['General'],
            summary: 'Redirect to OpenAPI documentation',
            description: 'Redirects to the OpenAPI documentation for this API. Please do not make any requests to this endpoint.'
        }
    }
);

app.get(
    '/source',
    ({ set }) => {
        set.status = 307;
        set.headers['Location'] = 'https://github.com/GalvinPython/modrinth-badge';
        return 'Redirecting...';
    },
    {
        detail: {
            tags: ['General'],
            summary: 'Redirect to GitHub repository',
            description: 'Redirects to the GitHub repository for modrinth-shields. Please do not make any requests to this endpoint.'
        }
    }
);

app.get(
    '/badge/:projectId',
    async ({ params, query, set }) => {
        const { projectId } = params;
        const optionIgnoreSnapshots = query.ignoresnapshots === 'true';

        // Set appropriate headers
        set.headers['Deprecation'] = '@1763942400'
        set.headers['Content-Type'] = 'image/svg+xml';

        const httpResponse = await fetch(`https://api.modrinth.com/v2/project/${projectId}`);
        if (!httpResponse.ok) {
            set.status = 404;
            return makeBadge({
                label: 'Error',
                message: 'Project not found',
                color: '#ff0000',
                style: 'flat',
                labelColor: '#fff',
                logoBase64: `data:image/svg+xml;base64,${btoa(siModrinth.svg)}`,
            });
        }

        const projectData = (await httpResponse.json()) as ModrinthAPIResponse;
        let versions = projectData.game_versions;

        if (optionIgnoreSnapshots) {
            const mcVersionsResponse = await getMinecraftVersions();
            if (mcVersionsResponse instanceof Error) return makeBadge({
                label: 'Error',
                message: 'Could not fetch Minecraft versions',
                color: '#ff0000',
                style: 'flat',
                labelColor: '#fff',
                logoBase64: `data:image/svg+xml;base64,${btoa(siModrinth.svg)}`,
            });
        }

        return makeBadge({
            label: 'Supported Versions',
            message: versions.join(' | '),
            color: '#00AF5C',
            style: 'flat',
            labelColor: '#fff',
            logoBase64: `data:image/svg+xml;base64,${btoa(siModrinth.svg)}`,
        });
    },
    {
        params: t.Object({
            projectId: t.String({ description: 'The Modrinth project slug or ID' })
        }),
        query: t.Object({
            ignoresnapshots: t.Optional(
                t.String({
                    enum: ['false', 'true'],
                    description: 'Ignore snapshot versions (true/false). Defaults to false.'
                })
            ),
        }),
        detail: {
            deprecated: true,
            tags: ['Badges'],
            summary: 'Generate a supported Minecraft versions badge for a Modrinth project',
            description:
                '**Deprecated - Use `/badge/versions/:projectId` instead.**'
        }
    }
);

app.get(
    '/badge/versions/:projectId',
    async ({ params, query, set }) => {
        const { projectId } = params;
        const optionIgnoreSnapshots = query.ignoresnapshots === 'true';

        // Set appropriate headers
        set.headers['Content-Type'] = 'image/svg+xml';

        const httpResponse = await fetch(`https://api.modrinth.com/v2/project/${projectId}`);
        if (!httpResponse.ok) {
            set.status = 404;
            return makeBadge({
                label: 'Error',
                message: 'Project not found',
                color: '#ff0000',
                style: 'flat',
                labelColor: '#fff',
                logoBase64: `data:image/svg+xml;base64,${btoa(siModrinth.svg)}`,
            });
        }

        const projectData = (await httpResponse.json()) as ModrinthAPIResponse;
        let versions = projectData.game_versions;

        if (optionIgnoreSnapshots) {
            const mcVersionsResponse = await getMinecraftVersions();
            if (mcVersionsResponse instanceof Error) return makeBadge({
                label: 'Error',
                message: 'Could not fetch Minecraft versions (Server issue)',
                color: '#ff0000',
                style: 'flat',
                labelColor: '#fff',
                logoBase64: `data:image/svg+xml;base64,${btoa(siModrinth.svg)}`,
            });
        }

        return makeBadge({
            label: 'Supported Versions',
            message: versions.join(' | '),
            color: '#00AF5C',
            style: 'flat',
            labelColor: '#fff',
            logoBase64: `data:image/svg+xml;base64,${btoa(siModrinth.svg)}`,
        });
    },
    {
        params: t.Object({
            projectId: t.String({ description: 'The Modrinth project slug or ID' })
        }),
        query: t.Object({
            ignoresnapshots: t.Optional(
                t.String({
                    enum: ['false', 'true'],
                    description: 'Ignore snapshot versions (true/false). Defaults to false.'
                })
            ),
        }),
        detail: {
            tags: ['Badges'],
            summary: 'Generate a supported Minecraft versions badge for a Modrinth project',
            description:
                'Returns an SVG badge showing supported Minecraft versions. Optionally ignores snapshot versions if `?ignoresnapshots=true`.'
        }
    }
);

app.get(
    '/badge/loaders/:projectId',
    async ({ params, query, set }) => {
        const { projectId } = params;
        const optionIgnoreSnapshots = query.ignoresnapshots === 'true';

        // Set appropriate headers
        set.headers['Content-Type'] = 'image/svg+xml';

        const httpResponse = await fetch(`https://api.modrinth.com/v2/project/${projectId}/version`);
        if (!httpResponse.ok) {
            set.status = 404;
            return makeBadge({
                label: 'Error',
                message: 'Project not found',
                color: '#ff0000',
                style: 'flat',
                labelColor: '#fff',
                logoBase64: `data:image/svg+xml;base64,${btoa(siModrinth.svg)}`,
            });
        }

        const projectData = (await httpResponse.json()) as ModrinthAPIVersionsResponse;

        if (!projectData || projectData.length === 0) {
            set.status = 404;
            return makeBadge({
                label: 'Error',
                message: 'Project not found',
                color: '#ff0000',
                style: 'flat',
                labelColor: '#fff',
                logoBase64: `data:image/svg+xml;base64,${btoa(siModrinth.svg)}`,
            });
        }

        const loaders = [...new Set(projectData.flatMap(v => v.loaders ?? []))];

        if (optionIgnoreSnapshots) {
            const mcVersionsResponse = await getMinecraftVersions();
            if (mcVersionsResponse instanceof Error) return makeBadge({
                label: 'Error',
                message: 'Could not fetch Minecraft versions (Server issue)',
                color: '#ff0000',
                style: 'flat',
                labelColor: '#fff',
                logoBase64: `data:image/svg+xml;base64,${btoa(siModrinth.svg)}`,
            });
        }

        return makeBadge({
            label: 'Supported Loaders',
            message: loaders.join(' | '),
            color: '#00AF5C',
            style: 'flat',
            labelColor: '#fff',
            logoBase64: `data:image/svg+xml;base64,${btoa(siModrinth.svg)}`,
        });
    },
    {
        params: t.Object({
            projectId: t.String({ description: 'The Modrinth project slug or ID' })
        }),
        detail: {
            tags: ['Badges'],
            summary: 'Generate a supported Minecraft loaders badge for a Modrinth project',
            description:
                'Returns an SVG badge showing supported Minecraft loaders.'
        }
    }
);

app.listen(port, () => {
    console.log(`Server running on http://localhost:${port}`);
});
