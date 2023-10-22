![asmr-dl](https://socialify.git.ci/daydreamer-json/asmr-dl/image?description=1&forks=1&issues=1&language=1&logo=https%3A%2F%2Fraw.githubusercontent.com%2Fdaydreamer-json%2Fasmr-dl%2Fmain%2Fmedia%2Ficon%2Fatom.svg&owner=1&pattern=Circuit%20Board&pulls=1&stargazers=1&theme=Auto)

## About

This is a simple Node.js command line tool that I built for myself.

Feel free to contribute!

## Usage

```text
asmr-dl <command> [argument] [option]

Commands:
  asmr-dl download [id]  Download ASMR work                        [aliases: dl]
  asmr-dl lookup [id]    Display metadata of ASMR work           [aliases: info]

Options:
  --help     Show help                                                 [boolean]
  --version  Show version number                                       [boolean]
```

```text
asmr-dl download [id]

Download ASMR work

Positionals:
  id  DLsite RJ Code (Work ID)                               [number] [required]

Options:
      --help          Show help                                        [boolean]
      --version       Show version number                              [boolean]
  -o, --output-dir    Output directory              [string] [default: "output"]
  -f, --force         Force overwrites existing files [boolean] [default: false]
  -t, --thread        Number of parallel downloads        [number] [default: 10]
      --lang          Set language of work metadata
                [string] [choices: "ja-jp", "en-us", "zh-cn"] [default: "ja-jp"]
      --proxy         Use streaming API server
                                         [deprecated] [boolean] [default: false]
      --disable-ping  Disable pinging the server
                      This option reduces startup time
                                         [deprecated] [boolean] [default: false]
      --log-level     Set log level
          [string] [choices: "trace", "debug", "info", "warn", "error", "fatal"]
                                                               [default: "info"]
```

```text
asmr-dl lookup [id]

Display metadata of ASMR work

Positionals:
  id  DLsite RJ Code (Work ID)                               [number] [required]

Options:
  --help          Show help                                            [boolean]
  --version       Show version number                                  [boolean]
  --lang          Set language of work metadata
                [string] [choices: "ja-jp", "en-us", "zh-cn"] [default: "ja-jp"]
  --proxy         Use streaming API server
                                         [deprecated] [boolean] [default: false]
  --disable-ping  Disable pinging the server
                  This option reduces startup time
                                         [deprecated] [boolean] [default: false]
  --log-level     Set log level
          [string] [choices: "trace", "debug", "info", "warn", "error", "fatal"]
                                                               [default: "info"]
```

## To-Do

- [x] Download
  - [x] Specify output path
  - [x] Parallel download (w/Any parallel connect count)
  - [x] Cover image download (forced)
  - [x] Metadata JSON download (selectable)
  - [ ] Mirror server support
  - [x] Streaming API server support
  - [ ] Change module `axios` to `node-fetch`
- [x] Metadata lookup

---

(C) 2023 daydreamer-json
