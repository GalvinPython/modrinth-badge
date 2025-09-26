import { makeBadge } from 'badge-maker';
import { siModrinth } from 'simple-icons';
import { Elysia, t } from 'elysia';
import { cors } from '@elysiajs/cors';
import { openapi } from '@elysiajs/openapi';
import type { ModrinthAPIResponse } from './types';
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
app.use(openapi());

// Preload cache
getMinecraftVersions();

app.get(
    '/',
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

        const httpResponse = await fetch(`https://api.modrinth.com/v2/project/${projectId}`);
        if (!httpResponse.ok) {
            set.status = 404;
            set.headers['Content-Type'] = 'image/svg+xml';
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
            if (mcVersionsResponse instanceof Error) return;

            versions = versions.filter(version => {
                const isSnapshot = mcVersionsResponse.versions.find(v => v.id === version)?.type === 'snapshot';
                return !isSnapshot;
            });
        }

        set.headers['Content-Type'] = 'image/svg+xml';
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
            // useloadersinstead: t.Optional(
            //     t.String({
            //         enum: ['false', 'true'],
            //         description: 'Use loaders instead of game versions (true/false). Defaults to false.'
            //     })
            // )
        }),
        detail: {
            tags: ['Badges'],
            summary: 'Generate a supported Minecraft versions badge for a Modrinth project',
            description:
                'Returns an SVG badge showing supported Minecraft versions. Optionally ignores snapshot versions if `ignoresnapshots=true`.'
        }
    }
);

app.listen(port, () => {
    console.log(`Server running on http://localhost:${port}`);
});
