# GitHub to jsDelivr Link Converter
This utility helps you convert various GitHub file links into jsDelivr CDN links for easy integration into your projects. Additionally, it provides an embed code for direct usage in HTML and supports generating direct links with or without the latest commit hash.

## How to Use

1. Copy the GitHub file URL in one of the following formats:
    - `https://github.com/user/repo/blob/branch/path`
    - `https://github.com/user/repo/raw/branch/path`
    - `https://github.com/user/repo/blame/branch/path`
    - `https://raw.githubusercontent.com/user/repo/branch/path`
2. Convert the URL to the jsDelivr format:
    - Replace `https://github.com/user/repo/blob/branch/path` with `https://cdn.jsdelivr.net/gh/user/repo@branch/path`.
    - Replace `https://github.com/user/repo/raw/branch/path` with `https://cdn.jsdelivr.net/gh/user/repo@branch/path`.
    - Replace `https://github.com/user/repo/blame/branch/path` with `https://cdn.jsdelivr.net/gh/user/repo@branch/path`.
    - Replace `https://raw.githubusercontent.com/user/repo/branch/path` with `https://cdn.jsdelivr.net/gh/user/repo@branch/path`.

### Direct Link Options

- **Direct link with latest commit (long hash):**
  ```
  https://cdn.jsdelivr.net/gh/user/repo@commit_hash/path
  ```
- **Direct link with latest commit (short hash):**
  ```
  https://cdn.jsdelivr.net/gh/user/repo@commit_short_hash/path
  ```
- **Direct link without latest commit:**
  ```
  https://cdn.jsdelivr.net/gh/user/repo@branch/path
  ```

### Example

**GitHub URL:**
```
https://github.com/username/repository/blob/main/file.js
```

**jsDelivr Link:**
```
https://cdn.jsdelivr.net/gh/username/repository@main/file.js
```

**Embed Code:**
```html
<script src="https://cdn.jsdelivr.net/gh/username/repository@main/file.js"></script>
```

**Direct Link with Latest Commit (Long Hash):**
```
https://cdn.jsdelivr.net/gh/username/repository@d6f8e9c3a2b4c5d6e7f8g9h0/file.js
```

**Direct Link with Latest Commit (Short Hash):**
```
https://cdn.jsdelivr.net/gh/username/repository@d6f8e9/file.js
```

## Benefits of Using jsDelivr

- Faster content delivery via a global CDN.
- Automatic caching for improved performance.
- Reliable and scalable for production use.

## Notes

- Always specify a version, branch, or commit hash to avoid unexpected changes.
- For large files, consider alternative hosting solutions.

Happy coding!