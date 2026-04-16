module.exports = {
  branches: [
    'mainline',
    { name: '4.x', range: '4.x', channel: '4.x' },
    { name: 'beta', prerelease: true }
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
