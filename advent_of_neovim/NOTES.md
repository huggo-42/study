Build from source:
- https://github.com/neovim/neovim/blob/master/BUILD.md

## First Configuration!
- Open `$HOME/.config/nvim/init.lua`
- Add `print("Hello, World!")`
- Re-open Neovim, check `:messages`

## Reload Configuration!
- `:source %` % is a placeholder that means current file
- `SHIFT+V+:` (select current line) -> `:lua ...` or `:'<,'>lua`

