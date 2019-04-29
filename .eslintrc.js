module.exports = {
    extends: ['eslint-config-alloy/vue'],
    globals: {
        // your project global config
        // Vue is not allowed to assign
        Vue: false
    },
    rules: {
        // @fixable
        // js file indent
        indent: ['error', 4],
        'guard-for-in': 0,
        // @fixable
        // vue file indent
        'vue/script-indent': ['error', 4, { baseIndent: 1 }]
    },
    // change indent rules for different files
    overrides: [
        {
            files: ['*.vue'],
            rules: {
                indent: 'off'
            }
        },
        {
            files: ['*.js'],
            rules: {
                'vue/script-indent': 'off'
            }
        }
    ]
};
