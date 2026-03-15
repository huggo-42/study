# Treesitter

- Easy way to write parser
- Treesitter parsers are incremental


```lua
-- lua/config/plugins/treesitter.lua
return {
  "nvim-treesitter/nvim-treesitter",
  build = ":TSUpdate"
}
```

The `build` keyword tells lazy: whenever we update this plugin, call ":TSUpdate"
