# 04 - Package Manager

# Package Manager

- https://lazy.folke.io/installation

Before adding Lazy boilerplate:
$ :echo nvim_list_runtime_paths()
['/home/huggo/.config/nvimexample', '/usr/local/share/nvim/runtime', '/usr/local/sha
re/nvim/runtime/pack/dist/opt/netrw', '/usr/local/share/nvim/runtime/pack/dist/opt/m
atchit', '/usr/local/lib/nvim']

After adding Lazy boilerplate:
$ :echo nvim_list_runtime_paths()
['/home/huggo/.config/nvimexample', '/home/huggo/.local/share/nvimexample/lazy/lazy.nvim', '/usr/local/share/nvim/runtime', '/usr/local
/share/nvim/runtime/pack/dist/opt/netrw', '/usr/local/share/nvim/runtime/pack/dist/opt/matchit', '/usr/local/lib/nvim']

$ :echo stdpath("data")
/home/huggo/.local/share/nvimexample

Lazy recommends to checkhealth:
`:checkhealth lazy`

## Installing a colorscheme
- Tokyo Night Color Scheme
    - https://github.com/folke/tokyonight.nvim

```lua
{ "folke/tokyonight.nvim", config = function() vim.cmd.colorscheme "tokyonight" end }
```

`nvim_list_runtime_paths` after adding the colorscheme
$ :echo nvim_list_runtime_paths()
['/home/huggo/.config/nvimexample', '/home/huggo/.local/share/nvimexample/lazy/lazy.nvim', '/home/huggo/.local/share/nvimexample/lazy/t
okyonight.nvim', '/usr/local/share/nvim/runtime', '/usr/local/share/nvim/runtime/pack/dist/opt/netrw', '/usr/local/share/nvim/runtime/p
ack/dist/opt/matchit', '/usr/local/lib/nvim', '/home/huggo/.local/state/nvimexample/lazy/readme']

## Installing `mini`

- Mini.nvim
    - https://github.com/echasnovski/mini.nvim

- Setup statusline

```lua
-- lua/custom/plugins/mini.lua
return {
    'echasnovski/mini.nvim',
    config = function()
        local statusline = require 'mini.statusline'
        statusline.setup { use_icons = true }
    end
}
```

