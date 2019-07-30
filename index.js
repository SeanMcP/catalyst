#!/usr/bin/env node

const fs = require('fs')
const chalk = require('chalk')
const ask = require('inquirer')
const pascal = require('pascal-case')
const isValidPath = require('is-valid-path')
const prettier = require('prettier')

const init = () => {
    console.log('==================================')
    console.log(
        chalk.cyan(" ⚛️  Let's create a ") + chalk.cyan.bold('new component!')
    )
    console.log('==================================')
}

const prettierConfig = {
    arrowParens: 'always',
    parser: 'babel',
    singleQuote: true
}

const filterPath = value => {
    if (value.length < 1) {
        return './'
    } else if (value.charAt(value.length - 1) !== '/') {
        return value + '/'
    }
    return value
}

const askQuestions = () => {
    return ask.prompt([
        {
            name: 'name',
            type: 'input',
            message: 'Name:',
            filter: value => pascal(value)
        },
        {
            type: 'list',
            name: 'type',
            message: 'Type:',
            choices: ['Class', 'Function']
        },
        {
            type: 'confirm',
            name: 'connected',
            message: 'Connected to Redux?'
        },
        {
            type: 'list',
            name: 'extension',
            message: 'Extension:',
            choices: ['.js', '.jsx']
        },
        {
            type: 'input',
            name: 'path',
            message: 'Directory path:',
            validate: value =>
                isValidPath(value) ||
                `Uh oh! \`${value}\` is not a valid file path.`,
            filter: filterPath
        }
    ])
}

function createFile(props) {
    const { connected, extension = '.js', name, path, type } = props
    const filePath = path + name + extension
    console.log(
        chalk.green(
            `Creating a ${
                connected ? 'connected ' : ''
            }${type.toLowerCase()} component at ${filePath}...`
        )
    )
    fs.writeFileSync(filePath, buildContent(props))
    return filePath
}

function buildContent({ connected, extension, name, type }) {
    let content = `
        // ${name}${extension}
        import React from 'react';
        import PropTypes from 'prop-types';
    `
    if (connected) content += `import { connect } from 'react-redux';`
    content += `

    `
    if (type === 'Class') {
        content += `
            class ${name} extends React.Component {
                render() {
        `
    } else if (type === 'Function') {
        content += `const ${name} = (props) => {`
    }
    content += `
        return (
            <div className="${name}">
                {/* Add content here */}
            </div>
        );
    `
    if (type === 'Class') content += `}` // Close render method
    content += `}
    
    ` // Close component
    if (connected) {
        content += `
        const mapStateToProps = (state, ownProps) => {
            return {
                // Map state here
            }
        }
        
        const mapDispatchToProps = {
            // Map dispatch here
        }
        `
    }
    content += `
    
    ${name}.propTypes = {
        // Add prop types here
    }

    `
    if (connected) {
        content += `export default connect(mapStateToProps, mapDispatchToProps)(${name});`
    } else {
        content += `export default ${name};`
    }

    return prettier.format(content, prettierConfig)
}

const run = async () => {
    init()

    const answers = await askQuestions()
    createFile(answers)
}

module.exports = run
