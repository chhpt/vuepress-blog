<template>
    <div class="blog">
        <div class="blog-header">
            <div class="blog-info">
                <span class="tag-list">
                    <span class="tag-list__item"
                          v-for="tag in tags">{{tag}}</span>
                </span>
                <time class="time"
                      :datetime="$frontmatter.date">
                    {{ publishDate }}
                </time>
            </div>
            <h1 class="blog-title">{{ $page.title }}</h1>
        </div>

        <Content custom />

        <div class="page-edit">
            <div class="last-updated"
                 v-if="lastUpdated">
                <span class="prefix">{{ lastUpdatedText }}: </span>
                <time class="time"
                      :datetime="$page.lastUpdated">{{ lastUpdated }}</time>
            </div>
        </div>

        <div class="page-nav"
             v-if="prev || next">
            <p class="inner">
                <span v-if="prev"
                      class="prev">
                    ←
                    <router-link v-if="prev"
                                 class="prev"
                                 :to="prev.path">
                        {{ prev.title || prev.path }}
                    </router-link>
                </span>

                <span v-if="next"
                      class="next">
                    <router-link v-if="next"
                                 :to="next.path">
                        {{ next.title || next.path }}
                    </router-link>
                    →
                </span>
            </p>
        </div>

        <slot name="bottom" />
    </div>
</template>

<script>
    import {
        resolvePage,
        normalize,
        outboundRE,
        endingSlashRE
    } from '../mixins/util';

    export default {
        name: 'Blog',

        props: ['sidebarItems'],

        computed: {
            lastUpdated() {
                if (this.$page.lastUpdated) {
                    const dateFormat = new Date(this.$page.lastUpdated);
                    const options = {
                        year: 'numeric',
                        month: '2-digit',
                        day: '2-digit'
                    };

                    return dateFormat
                        .toLocaleDateString('zh-Hans-CN', options)
                        .replace(/\//g, '-');
                }
            },

            lastUpdatedText() {
                if (typeof this.$themeLocaleConfig.lastUpdated === 'string') {
                    return this.$themeLocaleConfig.lastUpdated;
                }
                if (typeof this.$site.themeConfig.lastUpdated === 'string') {
                    return this.$site.themeConfig.lastUpdated;
                }
                return 'Last Updated';
            },

            prev() {
                const prev = this.$page.frontmatter.prev;
                if (prev === false) {
                    return;
                } else if (prev) {
                    return resolvePage(this.$site.pages, prev, this.$route.path);
                } else {
                    return resolvePrev(this.$page, this.sidebarItems);
                }
            },

            next() {
                const next = this.$page.frontmatter.next;
                if (next === false) {
                    return;
                } else if (next) {
                    return resolvePage(this.$site.pages, next, this.$route.path);
                } else {
                    return resolveNext(this.$page, this.sidebarItems);
                }
            },

            editLink() {
                if (this.$page.frontmatter.editLink === false) {
                    return;
                }
                const {
                    repo,
                    editLinks,
                    docsDir = '',
                    docsBranch = 'master',
                    docsRepo = repo
                } = this.$site.themeConfig;

                let path = normalize(this.$page.path);
                if (endingSlashRE.test(path)) {
                    path += 'README.md';
                } else {
                    path += '.md';
                }
                if (docsRepo && editLinks) {
                    return this.createEditLink(
                        repo,
                        docsRepo,
                        docsDir,
                        docsBranch,
                        path
                    );
                }
            },

            editLinkText() {
                return (
                    this.$themeLocaleConfig.editLinkText ||
                    this.$site.themeConfig.editLinkText ||
                    `Edit this page`
                );
            },

            publishDate() {
                const dateFormat = new Date(this.$frontmatter.date);
                const options = {
                    year: 'numeric',
                    month: '2-digit',
                    day: '2-digit'
                };

                return dateFormat
                    .toLocaleDateString('zh-Hans-CN', options)
                    .replace(/\//g, '-');
            },

            tags() {
                return this.$page.frontmatter.tags;
            },

            urlPostTitle() {
                return encodeURIComponent(this.$page.title);
            }
        },

        methods: {
            createEditLink(repo, docsRepo, docsDir, docsBranch, path) {
                const bitbucket = /bitbucket.org/;
                if (bitbucket.test(repo)) {
                    const base = outboundRE.test(docsRepo) ? docsRepo : repo;
                    return (
                        base.replace(endingSlashRE, '') +
                        `/${docsBranch}` +
                        (docsDir ? '/' + docsDir.replace(endingSlashRE, '') : '') +
                        path +
                        `?mode=edit&spa=0&at=${docsBranch}&fileviewer=file-view-default`
                    );
                }

                const base = outboundRE.test(docsRepo)
                    ? docsRepo
                    : `https://github.com/${docsRepo}`;

                return (
                    base.replace(endingSlashRE, '') +
                    `/edit/${docsBranch}` +
                    (docsDir ? '/' + docsDir.replace(endingSlashRE, '') : '') +
                    path
                );
            }
        },

        mounted() {
            let tweets = document.querySelectorAll('.twitter-tweet');

            if (tweets && tweets.length > 0) {
                tweets.forEach(tweet => {
                    let id = tweet.dataset.twitterId;
                    twttr.widgets.createTweet(id, tweet);
                    tweet.setAttribute(
                        'style',
                        'border: 0; padding: 0; margin-right: 0;'
                    );
                    tweet.children[0].setAttribute('style', 'display: none;');
                });
            }
        }
    };

    function resolvePrev(page, items) {
        return find(page, items, -1);
    }

    function resolveNext(page, items) {
        return find(page, items, 1);
    }

    function find(page, items, offset) {
        const res = [];
        items.forEach(item => {
            if (item.type === 'group') {
                res.push(...(item.children || []));
            } else {
                res.push(item);
            }
        });
        for (let i = 0; i < res.length; i++) {
            const cur = res[i];
            if (cur.type === 'page' && cur.path === page.path) {
                return res[i + offset];
            }
        }
    }
</script>

<style lang="stylus">
    @import '../styles/config.styl';
    @require '../styles/wrapper.styl';

    .blog-header {
        @extend $wrapper;
        padding-top: 4.6rem;
        padding-bottom: 0;
        margin-bottom: -4rem;

        .tag-list__item {
            font-size: 0.9rem;
            padding: 5px;
            border: 1px solid #3780f7;
            border-radius: 3px;
            color: #3780f7;

            &:not(:first-child) {
                margin-left: 10px;
            }
        }

        .time {
            margin-left: 30px;
        }
    }

    .blog-title {
        margin-top: 0;
    }

    .blog-info {
        margin-bottom: 0.5rem;
        padding: 1rem 0;
        font-weight: bold;
    }

    .page-edit {
        @extend $wrapper;
        padding-top: 1rem;
        padding-bottom: 1rem;
        padding-left: 0;
        padding-right: 0;
        overflow: auto;

        .edit-link {
            display: inline-block;

            a {
                color: lighten($textColor, 25%);
                margin-right: 0.25rem;
            }
        }

        .last-updated {
            float: right;
            font-size: 0.9em;

            .prefix {
                font-weight: 500;
                color: lighten($textColor, 25%);
            }

            .time {
                font-weight: 400;
                color: #aaa;
            }
        }
    }

    .page-nav {
        padding-top: 1rem;
        padding-bottom: 0;

        .inner {
            min-height: 2rem;
            margin-top: 0;
            border-top: 1px solid $borderColor;
            padding-top: 1rem;
            overflow: auto; // clear float
        }

        .next {
            float: right;
        }
    }

    .twitter-tweet-rendered {
        margin: 10px auto;
    }

    @media (max-width: $MQMobile) {
        .page-edit {
            .edit-link {
                margin-bottom: 0.5rem;
            }

            .last-updated {
                font-size: 0.8em;
                float: none;
                text-align: left;
            }
        }
    }

    @media (max-width: $MQMobileNarrow) {
        .blog-title {
            font-size: 2.4rem;
        }
    }
</style>
