const { execSync } = require("child_process");

// Определяем текущую ветку
function getCurrentBranch() {
    // В CI используем GITHUB_REF
    if (process.env.GITHUB_REF) {
        const ref = process.env.GITHUB_REF;
        if (ref.startsWith("refs/heads/")) {
            return ref.replace("refs/heads/", "");
        }
        return ref;
    }
    // Локально используем git команду
    try {
        return execSync("git rev-parse --abbrev-ref HEAD", { encoding: "utf-8" }).trim();
    } catch (error) {
        // Если не удалось определить ветку, возвращаем null
        return null;
    }
}

const currentBranch = getCurrentBranch();
const isBetaBranch = currentBranch === "beta";

module.exports = {
    branches: [
        "main",
        { name: "beta", prerelease: true }
    ],
    plugins: [
        [
            "@semantic-release/commit-analyzer",
            {
                preset: "conventionalcommits",
                releaseRules: [
                    { scope: "no-release", release: false }
                ],
                parserOpts: {
                    noteKeywords: ["BREAKING CHANGE", "BREAKING CHANGES"]
                }
            }
        ],
        [
            "@semantic-release/release-notes-generator",
            {
                preset: "conventionalcommits"
            }
        ],
        // Changelog плагин только для main ветки, не для beta
        ...(isBetaBranch ? [] : [
            [
                "@semantic-release/changelog",
                {
                    changelogFile: "CHANGELOG.md"
                }
            ]
        ]),
        "@semantic-release/npm",
        "@semantic-release/github",
        "@semantic-release/git"
    ]
};

