# Backup Point - Before Platform Upgrade
**Date:** 2026-07-28
**Branch:** main
**Commit:** 459c56bc30a9a54f0e7ca12e6ed873e5a0d4c8ec

This commit marks the restore point before the major service platform upgrade.

## Preserved in this backup:
- Original single-page website (index.html)
- Database schema (db/schema.ts)
- API routes (netlify/functions/api.mts)
- Build configuration (netlify.toml, drizzle.config.ts)
- Google verification file
- Original sitemap
- All dependencies

## To restore to this point:
```bash
git checkout 459c56bc30a9a54f0e7ca12e6ed873e5a0d4c8ec
```

## Restore branch created:
- upgrade/service-platform-2026
