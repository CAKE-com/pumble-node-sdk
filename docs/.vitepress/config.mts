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
                    { text: "Basic Concepts", link: "/basic-concepts" },
                    { text: "Advanced Concepts", link: "/advanced-concepts" },
                    { text: "Pumble CLI", link: "/pumble-cli" },
                ],
            },
            {
                text: "Reference",
                items: [
                    { text: "Triggers", link: "/triggers-reference" },
                    { text: "Api Client", link: "/api-client" },
                    { text: "Manifest", link: "/manifest" },
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
