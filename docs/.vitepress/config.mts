import { defineConfig } from "vitepress";

// https://vitepress.dev/reference/site-config
export default defineConfig({
    title: "Pumble SDK",
    description: "Build Pumble Apps",
    base: "/pumble-node-sdk/",
    head: [
        // This will point to /public/favicon.ico
        ['link', { rel: 'icon', href: '/pumble-node-sdk/favicon.ico' }]
    ],
    themeConfig: {
        // https://vitepress.dev/reference/default-theme-config
        logo: '/favicon.ico',
        nav: [
            { text: "Home", link: "/" },
            { text: "Getting Started", link: "/getting-started" },
        ],

        sidebar: [
            {
                text: "Guide",
                items: [
                    { text: "Getting started", link: "/getting-started" },
                    { text: "Authorization", link: "/authorization" },
                    { text: "Basic Concepts", link: "/basic-concepts" },
                    { text: "Interactivity", link: "/interactivity" },
                    { text: "Modals & Views", link: "/modals-views" },
                    { text: "Advanced Concepts", link: "/advanced-concepts" },
                    { text: "Pumble CLI", link: "/pumble-cli" },
                    { text: "Production deployment", link: "/production-deployment" },
                    { text: "Publishing to CAKE.com Marketplace", link: "/publish-to-marketplace" }
                ],
            },
            {
                text: "Reference",
                items: [
                    { text: "Manifest", link: "/manifest" },
                    { text: "Triggers", link: "/triggers-reference" },
                    { text: "API Client", link: "/api-client" },
                    { text: "Blocks", link: "/blocks"},
                    { text: "Modals & Views", link: "/modals-views-reference" },
                ],
            },
        ],

        socialLinks: [
            {
                icon: "github",
                link: "https://github.com/CAKE-com/pumble-node-sdk",
            },
        ],
        search: {
            provider: 'local',
            options: {
                detailedView: true,
                translations: {
                    button: {
                        buttonText: 'Search docs',
                        buttonAriaLabel: 'Search docs'
                    }
                },
                // Advanced: Fine-tune the search engine (MiniSearch)
                miniSearch: {
                    searchOptions: {
                        fuzzy: 0.2, // Allows for 1-2 character typos
                        prefix: true, // Matches "pum" to "pumble"
                        boost: { title: 2 } // Title matches are twice as relevant
                    }
                }
            }
        }
    },
});
