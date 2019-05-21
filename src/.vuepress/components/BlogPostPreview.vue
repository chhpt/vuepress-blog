<template>
    <section class="blog-post">
        <div class="blog-post__title">
            <a :href="path"
               class="blog-post__link">
                {{ title }}
            </a>
        </div>
        <p v-if="excerpt"
           class="blog-post__excerpt">
            {{ excerpt }}
        </p>
        <div class="blog-post__info">
            <span class="tag-list">
                <span v-for="tag in tags"
                      class="tag-list__item">{{tag}}</span>
            </span>
            <time class="post-time">
                {{ formatPublishDate }}
            </time>
        </div>
    </section>
</template>
<script>
    export default {
        name: 'BlogPostPreview',
        props: {
            publishDate: {
                type: String,
                required: true
            },
            tags: {
                type: Array,
                required: false
            },
            title: {
                type: String,
                required: true
            },
            path: {
                type: String,
                required: true
            },
            excerpt: {
                type: String,
                required: false
            }
        },
        computed: {
            formatPublishDate() {
                const dateFormat = new Date(this.publishDate);
                const options = {
                    year: 'numeric',
                    month: '2-digit',
                    day: '2-digit'
                };

                return dateFormat
                    .toLocaleDateString('zh-Hans-CN', options)
                    .replace(/\//g, '-');
            }
        }
    };
</script>

<style lang="stylus" scoped>
    primary-color = #22AAFF;

    .blog-post {
        padding-bottom: 2.5rem;
        border-bottom: #EBF2F6 1px solid;
    }

    .blog-post__info {
        font-weight: bold;
    }

    .blog-post__excerpt {
        color: #515a6e;
    }

    .blog-post__link {
        font-weight: 700;
        color: #2c3e50;

        &:hover {
            text-decoration: underline;
        }
    }

    .blog-post__title {
        font-size: 1.5rem;
        font-weight: 700;
        margin-top: 0.5rem;
        margin-bottom: 0.75rem;

        a:hover {
            text-decoration: none;
        }
    }

    .button {
        font-weight: 500;
        border: 1px solid primary-color;
        border-radius: 4px;
        color: primary-color;
        font-size: 0.9rem;
        padding: 0.3rem 0.6rem;
        text-transform: uppercase;
        box-shadow: 0 0;
        transition: background-color 0.2s ease-in, color 0.2s ease-in;
    }

    .tag-list__item {
        font-size: 0.8rem;
        padding: 3px;
        border: 1px solid #3780f7;
        border-radius: 5px;
        color: #3780f7;

        &:not(:first-child) {
            margin-left: 10px;
        }
    }

    .post-time {
        margin-left: 10px;
    }
</style>
