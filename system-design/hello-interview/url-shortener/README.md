
General flow

1. Requirements
2. Core Entities
3. API or Interface
4. Data Flow
5. High-level Design
6. Deep Dives

# Step 1 - REQUIREMENTS

Functional Requirements
- create a short url from a long url
    - optionally support custom alias
    - optionally support an expiration time
- be redirected to the original url form the short url

Non-functional Requirements
- Low latency on redirects (~200ms)
- Scale to support 100M DAU and 18 urls
- Ensure uniqueness of short code
- High availability, eventual consistency for url shortening

# Step 2 - ENTITIES & API

* Core Entities -> don't do the whole model yet, just list all entities
- Original url
- Short url
- User

* API -> contract between our client or our users
> almost always is one to one map with Functional Requirements, just go back there

// shorten a url
POST /urls -> shortUrl
{
    originalUrl,
    alias?,
    expirationTime?
}

// redirection
GET {shortUrl} -> Redirect to OriginalUrl

# Step 3 - High-Level Design

> Take a look at the API and draw the system that's necessary in order to  satisfy that API

- 302 redirect - temporary
- 301 redirect - permanent -> the browser will cache and might not go to our service the next time

# Step 4 - Deep Dive

