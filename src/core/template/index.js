class Template {
    allVars = new Set()
    loopVars = new Set()
    buffered = []
    opsStack = []
    constructor(text, context = {}) {
        this.text = text
        this.context = context
    }

    parseT(ctx) {
        if (ctx && ctx instanceof Object) {
            this.context = ctx
        }

        const code = new CodeBuilder()
        this.code = code
        code.addFunction('render', 'doDots')
        code.startBlock()
        const varsCode = code.addSection()
        code.addLine('var result = []')

        const tokens = this.text.split(/({{.*?}}|{%.*?%}|{#.*?#})/g)
        for (let token of tokens) {
            if (/^\{#/.exec(token))
                continue
            else if (/^\{\{/.exec(token)) {
                const expr = this.exprCode(token.substring(2, token.length-2).trim())
                this.buffered.push(expr)
            } else if (/^\{\%/.exec(token)) {
                this.flushOutput()
                const words = token.substring(2, token.length-2).split(' ').filter(i => i)
                if (words[0] === 'if') {
                    this.opsStack.push('if')
                    code.addIf(this.exprCode(words[1]))
                    code.startBlock()
                } else if (words[0] === 'for') {
                    if (words.length !== 4 || words[2] !== 'in') {
                        throw new Error("Don't understand for:" + token)
                    }
                    this.opsStack.push('for')
                    this.loopVars.add(words[1])
                    code.addFor(
                        'c_' + words[1],
                        this.exprCode(words[3])
                    )
                    code.startBlock()
                } else if (/^end/.exec(words[0])) {
                    if (words.length !== 1) {
                        throw new Error("Don't understand end:" + token)
                    }
                    const endWhat = words[0].substring(3)
                    if (this.opsStack.length === 0) {
                        throw new Error("Too many ends:" + token)
                    }
                    const startWhat = this.opsStack.pop()
                    if (startWhat !== endWhat) {
                        throw new Error("Mismatched end tag:" + endWhat)
                    }
                    code.endBlock()
                } else {
                    throw new Error("Don't understand tag:" + words[0])
                }
            } else if (token) {
                this.buffered.push(this._formatStr(token))
            }
        }

        this.flushOutput()

        if (this.opsStack.length > 0) {
            throw new Error("Unmatched action tag:" + this.opsStack.pop())
        }

        Array.from(this.allVars.keys()).forEach(v => {
            if (!this.loopVars.has(v)) {
                let right;
                if (this.context[v] instanceof Function) {
                    right = this.context[v]
                } else if (this.context instanceof Object) {
                    right = JSON.stringify(this.context[v])
                } else {
                    right = this.context[v]
                }
                varsCode.addLine(`var c_${v}=${right}`)
            }
        })

        code.addLine('return result.join("")')

        code.endBlock()
    }

    render(ctx) {
        this.parseT(ctx)

        return eval('(' + this.code.getCode() + ')' + `(
            function doDots(dic, ...dots) {
                let v;
                dots.forEach(d => {
                    v = dic[d]
                })
                return v
            }
        )`)
    }

    exprCode(exp) {
        let code
        if (exp.includes('|')) {
            const pipes = exp.split('|')
            code = this.exprCode(pipes[0])
            pipes.slice(1).forEach(p => {
                this._variable(p)
                code = `c_${p}(${code})`
            })
        } else if (exp.includes('.')) {
            let dots = exp.split('.')
            code = this.exprCode(dots[0])
            const args = dots.splice(1).map(d => this._formatStr(d)).join(',')
            code = `doDots(${code},${args})`
        } else {
            this._variable(exp)
            code = "c_" + exp
        }
        return code
    }

    flushOutput() {
        if (this.buffered.length === 1) {
            this.code.addLine(`result.push(${this.buffered[0]})`)
        } else if (this.buffered.length > 1) {
            this.code.addLine(`result = result.concat([${this.buffered.join(',')}])`)
        }
        this.buffered = []
    }

    _variable(v) {
        if (!/^[_a-zA-Z][_a-zA-Z0-9]*$/.exec(v)) {
            throw new Error('Not a valid name:' + v)
        }
        this.allVars.add(v)
    }

    _formatStr(str) {
        str.replace('`', '\\`')
        return `\`${str}\``
    }
}

class CodeBuilder {
    code = []
    startBlock() {
        this.code.push('{')
    }
    endBlock() {
        this.code.push('}')
    }
    addSection() {
        const code = new CodeBuilder()
        this.code.push(code)
        return code
    }
    toString() {
        return this.code.join('')
    }
    addFunction(name, args) {
        this.code.push(`function ${name} (${args || ''})`)
    }
    addIf(exp) {
        this.code.push(`if (${exp})`)
    }
    addFor(flag, exp) {
        this.code.push(`for (let ${flag} of ${exp})`)
    }
    addLine(line) {
        this.code.push(line)
        this.code.push(';\n')
    }
    getCode() {
        return this.code.join('')
    }
}

// for test
function test() {
    const t = new Template(
        `{% if is_logged_in %}
            <p>Welcome, {{ user_name }}!</p>
        {% endif %}
        <p>Products:</p>
        <ul>
        {% for product in product_list %}
            <li>{{ product.name }}:
                {{ product.price|format_price }}</li>
        {% endfor %}
        </ul>`)
    console.log(t.render(
        {
            user_name: 'tom',
            product_list: [{name: 'aa', price: '0.1'}],
            format_price: (v) => v*10,
            is_logged_in: true
        }
    ))
    console.log('--------')
    console.log(t.render(
        {
            user_name: 'tom',
            product_list: [{name: 'aa', price: '0.1'}],
            format_price: (v) => v*10,
        }
    ))
}

// test()
