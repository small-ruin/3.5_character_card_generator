import { js2xml } from 'xml-js'

export const genLogLine2XMLByCast = cast => (line) => {
    if (line === 'COMMEND:SEPARATE')
        return `</speak><speak xmlns="http://www.w3.org/2001/10/synthesis" xmlns:mstts="http://www.w3.org/2001/mstts" xmlns:emo="http://www.w3.org/2009/10/emotionml" version="1.0" xml:lang="en-US">`

    if (!cast[line.sender])
        return ''

    console.log(line.sender, cast, line.sender in cast,
        js2xml({
            voice: {
               _text: line.content,
               _attributes: { name: cast[line.sender]}
            },
        }, {compact: true,})
        )

    return js2xml({
        voice: {
           _text: line.content + '。',
           _attributes: { name: cast[line.sender]}
        },
    }, { compact: true })
}

export const voices = [
    {label: '云希', value: 'zh-CN-YunxiNeural'},
    {label: '云野', value: 'zh-CN-YunyeNeural'},
    {label: '云伊', value: 'zh-CN-XiaoyiNeural'},
    {label: '晓墨', value: 'zh-CN-XiaomoNeural'},
    {label: '云泽', value: 'zh-CN-YunzeNeural'},
    {label: '晓梦', value: 'zh-CN-XiaomengNeural'},
]