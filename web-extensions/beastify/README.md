References:
- [Your_first_WebExtension](https://developer.mozilla.org/en-US/docs/Mozilla/Add-ons/WebExtensions/Your_first_WebExtension)
- [Your_second_WebExtension](https://developer.mozilla.org/en-US/docs/Mozilla/Add-ons/WebExtensions/Your_second_WebExtension)
- [Anatomy_of_a_WebExtension](https://developer.mozilla.org/en-US/docs/Mozilla/Add-ons/WebExtensions/Anatomy_of_a_WebExtension)
- [manifest.json](https://developer.mozilla.org/en-US/docs/Mozilla/Add-ons/WebExtensions/manifest.json)
- [user_interface/Extension_pages](https://developer.mozilla.org/en-US/docs/Mozilla/Add-ons/WebExtensions/user_interface/Extension_pages)

## Anatomy of an extension

#### `manifest.json`
The only file that is required for every extension.
Contains metadata:
    - name, version and required permissions.
Also can caontain:
    - Background scripts - scripts that respond to browser events.
    - Icons - the extension icon and buttons it might define.
    - Sidebars, popups, and options pages: HTML content for various user interface components.
    - Content scripts: JavaScript the extension injects into web pages.
    - Web-accessible resources: packaged content made accessible to web pages and content scripts.

                                   ┌─────────────────────────────────┐
                                   | Background page                 |
                                   |                          ┌────┐ |
                           ┌─────➜ |             ┌──────┐   ┌─| JS | |
                           |       |             | HTML | ┌─│ └────┘ |
                           |       |             └──────┘ │ └────┘   |
                           |       |                      └────┘     |
                           |       └─────────────────────────────────┘
                           |       
                           |       ┌────────────────────────────────────┐
                           |       | Content scripts                    |
                           |       |                 ┌────┐     ┌─────┐ |
                           |─────➜ |               ┌─| JS |   ┌─| CSS | |
                           |       |             ┌─│ └────┘ ┌─│ └─────┘ |
                           |       |             │ └────┘   │ └─────┘   |
                           |       |             └────┘     └─────┘     |
                           |       └────────────────────────────────────┘
                           |       
                           |       ┌────────────────────────────────────────────────────────┐
                           |       | Browser action                                         |
                           |       |                 ┌───────┐  ┌─────────────────────────┐ |
     ┌───────────────┐     |       |               ┌─| Icons |  | Popup                   | |
     | manifest.json |─────|─────➜ |             ┌─│ └───────┘  | ┌──────┐ ┌────┐ ┌─────┐ | |
     └───────────────┘     |       |             │ └───────┘    | | HTML | | JS | | CSS | | |
                           |       |             └───────┘      | └──────┘ └────┘ └─────┘ | |
                           |       |                            └─────────────────────────┘ |
                           |       └────────────────────────────────────────────────────────┘
                           |       
                           |       ┌────────────────────────────────────────────────────────┐
                           |       | Page action                                            |
                           |       |                 ┌───────┐  ┌─────────────────────────┐ |
                           |       |               ┌─| Icons |  | Popup                   | |
                           |─────➜ |             ┌─│ └───────┘  | ┌──────┐ ┌────┐ ┌─────┐ | |
                           |       |             │ └───────┘    | | HTML | | JS | | CSS | | |
                           |       |             └───────┘      | └──────┘ └────┘ └─────┘ | |
                           |       |                            └─────────────────────────┘ |
                           |       └────────────────────────────────────────────────────────┘
                           |        
                           |       ┌────────────────────────────────────────────────────────┐
                           |       | Options page                                           |
                           |─────➜ |             ┌──────┐ ┌────┐ ┌─────┐                    |
                           |       |             | HTML | | JS | | CSS |                    |
                           |       |             └──────┘ └────┘ └─────┘                    |
                           |       └────────────────────────────────────────────────────────┘
                           |       
                           |       ┌────────────────────────────────────────────────────────┐
                           |       | Web-accessible resources                               |
                           |       |                             ┌─────────┐                |
                           |       |                           ┌─|         |                |
                           └─────➜ |                         ┌─│ └─────────┘                |
                                   |                         │ └─────────┘                  |
                                   |                         └─────────┘                    |
                                   |                                                        |
                                   └───────────────────────────────────────────────────────┘


#### Background Scripts
Extensions responds to events that occur in the browser independently of the lifetime of any particular web page or browser window.
Can be persistent or non-persistent.
Persistent: load as soon as the extension loads and stay loaded until the extension is disabled or uninstalled. Only Manifest V2 extensions can use persistent background scripts.
Non-persistent: background scripts load when needed to respond to an event and unload when they become idle. Manifest V3 extensions use non-persistent background scripts only, and Manifest V2 extensions can opt in to this behavior.

#### Sidebars, popups, and options page
Sidebars: a pane displayed at the left of the browser window, next to the web page.
Popups: a dialog displayed when the user clicks on a toolbar button or address bar button
Options: a page shown when the user access your add-on's preferences in the browser's native add-ons manager.
For each of these components, you can create an HTML file and point to it using a specific property in `manifest.json`. The HTML file can include CSS and JS files, just like a standard web page.

##### Extension pages

##### Content scripts
Use scripts to manipulate web pages. Content scripts are loaded into web pages and run in the context of that particular page.
Content scripts can manipulate the page's DOM, like any other scripts loaded by the page. However, unlike normal page scripts, content scripts can:
- Use a small subset of the WebExtensions APIs
- Exchange messages with their background scripts, which a content script can use to request the background script to do something using a WebExtensions API.

#### Web-accessible resources
Resources - such as images, HTML, CSS, and JS - that you include in the extension and want to make accessible to content scripts and page scripts. Resources made web-accessible can be referenced by page scripts and content scripts using a special URI scheme.

For example, if a content script wants to insert images into web pages, you can include them in the extension and make them web-accessible. Then the content script could create and append `img` tags which reference the images via the `src` attribute.

