const processMd = (doc, options = {}) => {
  const diffs = []

  return remark()
    .use(extractDiffs, diffs)
    .use(highlight)
    .use(remarkGitHub, options)
    .use(html)
    .process(doc)
    .then((html) => ({ html, diffs }))
}

// A plugin that will extract all tortilla {{{diffStep}}}s given an ast by simply
// looking for parts in the markdown which are likely to be so
const extractDiffs = (exports) => {
  if (exports === undefined) {
    throw TypeError('exports must be provided')
  }

  if (!(exports instanceof Array)) {
    throw TypeError('exports must be an array')
  }

  return (ast) => {
    const root = ast.children

    root.map((node) => {
      if (
        node.type !== 'heading' ||
        node.depth !== 4 ||
        !node.children
      ) {
        return
      }

      let diffTitleNode = node.children[0]

      if (!diffTitleNode) return

      if (diffTitleNode.type === 'link' && diffTitleNode.children) {
        diffTitleNode = diffTitleNode.children[0]
      }

      if (!diffTitleNode || diffTitleNode.type !== 'text') return

      const title = diffTitleNode.value.match(/Step (\d+\.\d+)\:/)

      return title && {
        stepIndex: title[1],
        node,
      }
    })
    .filter(Boolean)
    .forEach(({ node, stepIndex }) => {
      let i = root.indexOf(node)

      const diff = {
        index: stepIndex,
        value: '',
      }

      exports.push(diff)

      while (
        (node = root[++i]) &&
        node.type === 'heading' &&
        node.depth === 5 &&
        node.children
      ) {
        const title = node.children.map(child => child.value).join('')

        let [operation, oldPath, newPath = oldPath] = title.match(
          /([^\s]+) ([^\s]+)(?: to ([^\s]+))?/
        ).slice(1)

        switch (operation) {
          case 'Added':
            oldPath = '/dev/null'
            newPath = `b/${newPath}`
            diff.value += `diff --git ${oldPath} ${newPath}\n`
            diff.value += 'new file mode 100644\n'
            diff.value += 'index 0000000..0000000\n'
            diff.value += `--- ${oldPath}\n`
            diff.value += `+++ ${newPath}\n`
            break;
          case 'Deleted':
            oldPath = `a/${oldPath}`
            newPath = '/dev/null'
            diff.value += `diff --git ${oldPath} ${newPath}\n`
            diff.value += 'deleted file mode 100644\n'
            diff.value += 'index 0000000..0000000\n'
            diff.value += `--- ${oldPath}\n`
            diff.value += `+++ ${newPath}\n`
            break;
          default:
            oldPath = `a/${oldPath}`
            newPath = `b/${newPath}`
            diff.value += `diff --git ${oldPath} ${newPath}\n`
            diff.value += 'index 0000000..0000000 100644\n'
            diff.value += `--- ${oldPath}\n`
            diff.value += `+++ ${newPath}\n`
        }

        while (
          (node = root[i + 1]) &&
          node.type === 'code' &&
          node.lang === 'diff'
        ) {
          root.splice(i + 1, 1)

          node.value.split('\n').forEach((line, j) => {
            if (j) {
              diff.value += line.match(/^(.)┊ *\d*┊ *\d*┊(.*)/).slice(1).join('') + '\n'
            } else {
              diff.value += line + '\n'
            }
          })
        }
      }
    })
  }
}
          Object.assign(step, await processMd(step.content, stepScope))
    releaseDate: release.releaseDate,