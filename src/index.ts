import { makeBadge } from 'badge-maker';
import { siModrinth } from 'simple-icons';
import { Elysia } from 'elysia'
import { cors } from '@elysiajs/cors'
import { openapi } from '@elysiajs/openapi'
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

// Load cache in background
getMinecraftVersions();

app.get('/', ({ set }) => {
    set.status = 307;
    set.headers['Location'] = 'https://github.com/GalvinPython/modrinth-badge';
    return 'Redirecting...';
});

app.get('/badge/:projectId', async ({ params, query, set }) => {
    const { projectId } = params;

    const optionRemoveSnapshots = query.removeSnapshots === 'true';

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

    if (optionRemoveSnapshots) {
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
});

app.listen(port, () => {
    console.log(`Server running on http://localhost:${port}`);
});