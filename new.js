const fs = require('fs');
const path = require('path');
const readline = require('readline');

const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

const frontMaster = (title, date) => `---
title: ${title}
date: ${date}
type: post
blog: true
excerpt: 文章简介
tags:
    - 标签
---

文章内容

## 请勿使用一级标题`;

const createArticle = title => {
    const now = new Date();
    const options = {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit'
    };

    const date = now
        .toLocaleDateString('zh-Hans-CN', options)
        .replace(/\//g, '-');
    const articleInfo = frontMaster(title, date);

    fs.writeFile(
        path.join(__dirname, 'src', 'blog', `${title}.md`),
        articleInfo,
        err => {
            if (err) {
                console.log('Error: ', err);
                return;
            }
            console.log('文章生成成功！');
            process.exit(0);
        }
    );
};

rl.question('请输入文章标题：\n', title => {
    if (!title) {
        console.log('文章标题不能为空！');
        process.exit(0);
    }
    createArticle(title);
});
