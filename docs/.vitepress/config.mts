import { defineConfig } from "vitepress";

// https://vitepress.dev/reference/site-config
export default defineConfig({
    title: "Pumble SDK",
    description: "Build Pumble Apps",
    base: "/pumble-node-sdk/",
    themeConfig: {
        // https://vitepress.dev/reference/default-theme-config
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
                    { text: "Production deployment", link: "/production-deployment" }
                ],
            },
            {
                text: "Reference",
                items: [
                    { text: "Manifest", link: "/manifest" },
                    { text: "Triggers", link: "/triggers-reference" },
                    { text: "Api Client", link: "/api-client" },
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
    },
});
