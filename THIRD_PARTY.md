# Third-party software in LuniOS

LuniOS builds are made from LuniOS's own work plus open source software from other
projects. Those projects keep their own licenses. The LuniOS [License and Terms](LICENSE.md)
do not change or limit them.

| Component | Project | License |
| --- | --- | --- |
| Android platform | [Android Open Source Project](https://source.android.com) | Apache License 2.0 and others, see the notices |
| LineageOS base | [LineageOS](https://lineageos.org) | Apache License 2.0 and others, see the notices |
| Linux kernel | [Android Common Kernel](https://android.googlesource.com/kernel/common/) | GNU GPL 2.0 ([text](licenses/GPL-2.0.txt)) |
| Google apps | MindTheGapps | Google's own terms; not part of LuniOS's license |
| Roboto Flex font (website) | [Google Fonts](https://fonts.google.com/specimen/Roboto+Flex) | SIL Open Font License 1.1 |

## Full notices

The complete list of open source components in a LuniOS build, with every license text,
is generated at build time. The files from the current build (LuniOS 1.2.2 beta, Pixel 8a)
are in [`notices/`](notices). They are gzip-compressed XML, the same files the system shows
on its third-party licenses screen in Settings:

- `system-NOTICE.xml.gz`
- `system_ext-NOTICE.xml.gz`
- `product-NOTICE.xml.gz`
- `vendor-NOTICE.xml.gz`

Common license texts: [Apache License 2.0](licenses/Apache-2.0.txt),
[GNU GPL 2.0](licenses/GPL-2.0.txt).

## Source code for GPL components

To get the source code of the GPL licensed components used in a LuniOS build, such as the
Linux kernel, open an issue in this repository.
