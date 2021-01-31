# whistle.data-extractor
whistle插件，可以用来从匹配到的pattern提取数据，替换到upstream指定地址获取到的模板中。
配置方式:
```
pattern data-extractor://{"upstream": "http://localhost:8080", extractRegex: ["<script>\\s*const\\s+data\\s*=([^<]+)"]}
```

例如：可以把pattern指定的ssr页面中的数据提取出来，替换到本地对应的html中
