module.exports = {
  branches: [
    'mainline'
  ],
  plugins: [
    [
      '@semantic-release/commit-analyzer',
      {
        preset: 'angular'
      }
    ],
    [
      '@semantic-release/release-notes-generator',
      {
        preset: 'angular'
      }
    ],
    '@semantic-release/changelog',
    [
      '@semantic-release/npm',
      {
        npmPublish: true,
        tarballDir: 'dist'
      }
    ],
    [
      '@semantic-release/github',
      {
        assets: [
          {
            path: 'dist/*.tgz'
          }
        ]
      }
    ],
    [
      '@semantic-release/git',
      {
        assets: [
          'package.json',
          'package-lock.json',
          'CHANGELOG.md',
          'dist/**/*.{js|css}'
        ]
      }
    ]
  ]
}
