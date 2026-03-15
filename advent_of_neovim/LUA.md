# 03 - Getting Started with the Lua Programming Language

## Table of Contents

- Comments
- Variables
- Control Flow
- Modules
- Functions
- Metatables
- Bonus :)

## Background Info

Lua is elegant

- Lua uses "Machanisms over Policies"
    - Lua gives machanisms to solve problems instead of pre-defined keywords like `plex` or `class`
- Lua is designed to be embedded
    - We're going to used embedded inside Neovim
- Lua is cool

## Comments

```lua
-- This is a comment. It starts with two dashes

--[[ This is also
     a comment.

     But it spans multiple lines!
--]]
```

## Variables: Simple Literals

```lua
local number = 5

local string = "Hello, world"
local single = 'also works'
local crazy = [[ This
 is multi line and literal ]]

local truth, lies = true, false

local nothing = nil
```

## Variables: Functions (are First Class)

```lua
local function hello(name)
    print("Hello!", name)
end

local greet = function(name)
    -- .. is string concatenation
    print("Greetings, " .. name .. "!")
end
```

High Order Function example:
```lua
local higher_order = function(value)
    local function(another)
        return value + another
    end
end

local add_one = higher_order(1)
print("add_one(2) -> ", add_one(2)) 
```
Output:
```
add_one(2) ->  3
```

## Variables: Tables

Effectively, Lua's only data structure.
- Same structure is used for maps & lists

As a list...
```lua
local list = { "first", 2, false, function() print("Fourth!") end }
print("Yup, 1-indexed:", list[1])
print("Fourth is 4...:", list[4]())
```
Output:
```
Yup, 1-indexed: first
Fourth!
Fourth is 4...:
```

As a map...

```lua
local t = {
    literal_key = "a string",
    ["an expression"] = "also works",
    [function() end] = true
}

print("literal_key   : ", t.literal_key)
print("an expression : ", t["an expression"])
print("function() end: ", t[function() end])
```
Output:
```
literal_key   :  a string
an expression :  also works
function() end:  nil
```

## Variables: Not Covered (TODO)
- Thread
- Userdata

## Control Flow: `for`

```lua
local favorite_accounts = { "teej_dv", "ThePrimeagen", "terminaldotshop" }
for index = 1, #favorite_accounts do -- # is not "hashtag", it gets the length of favorite_accounts
    print(index, favorite_accounts[index])
end

for index, value in ipairs(favorite_accounts) do
    print(index, value)
end
```
Output:
```
1 teej_dv
2 ThePrimeagen
3 terminaldotshop
1 teej_dv
2 ThePrimeagen
3 terminaldotshop
```

```lua
local reading_scores = { teej_dv = 9.5, ThePrimeagen = "N/A" }
for key, value in pairs(reading_scores) do
    print(key, value)
end
```
Output:
TODO: why teej is printed last instead of first? in the teej video, teej is printed first
```
ThePrimeagen N/A
teej_dv 9.5
```

## Control Flow: `if`

```lua
local function action(loves_coffe)
    if loves_coffe then
        print("Check out `ssh terminal.shop` - it's cool!")
    else
        print("Check out `ssh terminal.shop` - it's still cool!")
    end
end

-- "falsey": nil, false
action() -- Same as: action(nil)
action(false)

-- Everything else is "truthy"
action(true)
action(0)
action({})
```
Output:
```
Check out `ssh terminal.shop` - it's still cool!
Check out `ssh terminal.shop` - it's still cool!
Check out `ssh terminal.shop` - it's cool!
Check out `ssh terminal.shop` - it's cool!
Check out `ssh terminal.shop` - it's cool!
```

## Modules

There isn't anything special about modules.
Modules are just files!

```lua
-- foo.lua
local M = {}
M.cool_function = function() end
return M
```

```lua
-- bar.lua
local foo = require('foo')
foo.cool_function()
```

## Functions: Multiple Returns

```lua
local returns_four_values = function()
    return 1, 2, 3, 4
end

first, second, last = returns_four_values()

print("first: ", first)
print("second:", second)
print("last:  ", last)
-- The `4` is discarded :'(
```
Output:
```
first:  1
second: 2
last:   3
```

```lua
local variable_arguments = function(...)
    local arguments = { ... }
    for i, v in ipairs({...}) do print(i, v) end
    return unpack(arguments)
end

print("====================")
print("1:", variable_arguments("Hello", "World", "!"))
print("====================")
print("2:", variable_arguments("Hello", "World", "!"), "<lost>")
-- will print only the first arg, because we have only one "slot" for the print function
```
Output:
```
====================
1 Hello
2 World
3 !
1: Hello World !
====================
1 Hello
2 World
3 !
2: Hello <lost>
```

## Functions: Calling

String Shorthand

```lua
local single_string = function(s)
    return s .. " - WOW!"
end

local x = single_string("hi")
local y = single_string "hi"
print(x, y)
```
Output:
```
hi - WOW! hi - WOW!
```

Table Shorthand

```lua
local setup = function(opts)
    if opts.default == nil then
        opts.default = 17
    end

    print(opts.default, opts.other)
end

setup { default = 12, other = false }
setup { other = true }
```
Output:
```
12 false
17 true
```

## Functions: Colon Functions

```lua
local MyTable = {}

function Mytable.something(self, ...) end
function Mytable:something(...) end
```

## Metatables

Check metamethods

> Describe or change the behavior of tables.
> Really similiar to thunder methods in python or how you would implement different traits in rust,

```lua
local vector_mt = {}
vector_mt._add = function(left, right)
    return setmetatable({
        left[1] + right[1],
        left[2] + right[2],
        left[3] + right[3],
    }, vector_mt)
end

local v1 = setmetatable({ 3, 1, 5 }, vector_mt)
local ve = setmetatable({ -3, 2, 2 }, vector_mt)
local v3 = v1 + v2
vim.print(v3[1], v3[2], v3[3])
vim.print(v3 + v3)
```
Output:
```
0
3
7
{ 0, 6, 14,
  <metatable> = {
    __add = <function 1>
  }
}
```

```lua
local fib_mt = {
    __index = function(self, key)
        if key < 2 then return 1 end
        -- Update the table, to save the intermediate results
        self[key] = self[key - 2] + self[key - 1]
        -- Return the result
        return self[key]
    end
}

local fib = setmetatable({}, fib_mt)

print(fib[5])
print(fib[1000])
```
Output:
```
8
7.0330367711423e+208
```

Other notable fields:
- `__newindex(self, key, value)` (`self[key] = value`)
- `__call(self, ...)`

## Quick Neovim Goodies
```lua
vim.keymap.set("n", "<space><space>x", "<cmd>source %<CR>")
vim.keymap.set("n", "<space>x", ":.lua<CR>")
vim.keymap.set("v", "<space>x", ":lua<CR>")
```

```lua
-- Highlight when yanking (copying) text
--   Try it with `yap` in normal mode
--   See `:help vim.highlight.on_yank()`
vim.api.nvim_create_autocmd('TextYankPost', {
    desc = 'Highlight when yanking (copying) text',
    group = vim.api.nvim_create_augroup('kickstart-highlight-yank', { clear = true })
    callback = function()
        vim.highlight.on_yank()
    end,
})
```
