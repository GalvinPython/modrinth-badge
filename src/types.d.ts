export interface ModrinthAPIResponse {
    client_side: string
    server_side: string
    game_versions: Array<string>
    id: string
    slug: string
    project_type: string
    team: string
    organization: any
    title: string
    description: string
    body: string
    body_url: any
    published: string
    updated: string
    approved: string
    queued: string
    status: string
    requested_status: string
    moderator_message: any
    license: {
        id: string
        name: string
        url: string
    }
    downloads: number
    followers: number
    categories: Array<string>
    additional_categories: Array<any>
    loaders: Array<string>
    versions: Array<string>
    icon_url: string
    issues_url: string
    source_url: string
    wiki_url: any
    discord_url: any
    donation_urls: Array<any>
    gallery: Array<{
        url: string
        raw_url: string
        featured: boolean
        title: string
        description: string
        created: string
        ordering: number
    }>
    color: number
    thread_id: string
    monetization_status: string
}

export interface MinecraftVersionsResponse {
    latest: {
        release: string
        snapshot: string
    }
    versions: Array<{
        id: string
        type: "release" | "snapshot" | "old_alpha" | "old_beta"
        url: string
        time: string
        releaseTime: string
    }>
}
