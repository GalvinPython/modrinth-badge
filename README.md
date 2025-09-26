# Modrinth Shields

A custom sheilds.io badge maker for Modrinth projects

# How to use

To get the badge in your markdown file do

```md
[![Supported versions](https://modrinth-shields.imgalvin.me/badge/<projectid>)](https://modrinth.com/mod/<projectid>)
```

Like this:

[![Supported versions](https://modrinth-shields.imgalvin.me/badge/restrictedflying)](https://modrinth.com/mod/restrictedflying)

# Docs

Docs at: https://modrinth-shields.imgalvin.me/openapi#tag/badges

# Developers

To install dependencies:

```bash
bun install
```

To run:

```bash
bun run index.ts
```

This project was created using `bun init` in bun v1.2.22. [Bun](https://bun.com) is a fast all-in-one JavaScript runtime.
