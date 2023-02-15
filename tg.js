const fs = require("fs");
const pool = require("../src/utilities/mysql.js").pool;
const json = JSON.parse(fs.readFileSync('./result.json'))

const getPostTextById = (id) => {
  // const id = 2037
  const post = json.messages.filter(e => e.id === id)[0]

  console.log('------------')
  console.log('New post, post id:', id)
  return post.file + '#' + post.thumbnail + '#' + post.photo + '#' + post.text_entities.reduce((previous, current) => {
    if (current.type === 'italic') {
      current.text = `*${current.text}*`
    }
    if (current.type === 'bold') {
      current.text = `**${current.text}**`
    }
    if (current.type === 'link') {
      current.text = `[${current.text}](${current.text})`
    }
    if (current.type === 'text_link') {
      current.text = `[${current.text}](${current.href})`
    }
    if (current.type === 'mention') {
      current.text = `[${current.text}](https://${current.text.slice(1)}.t.me)`
    }
    if (current.type === 'italic') {
      current.text = `${current.text}`
    }
    if (current.type === 'strikethrough') {
      current.text = `~~${current.text}~~`
    }
    if (current.type === 'underline') {
      current.text = `<u>${current.text}<u>`
    }
    if (current.type === 'underline') {
      current.text = `<u>${current.text}<u>`
    }
    if (current.type === 'code') {
      current.text = `\`${current.text}\``
    }
    return previous + current.text // todo add different text types support
  }, '')
}

const ln = json.messages.length;
let i = 0

// console.log(new Set(json.messages.map(e => e.text_entities).reduce((previous, current) => {
//   return [...previous, ...current.map(e => e.type)]
// }, []))
// )

let text = ''
while (i < ln) {
  const id = json.messages[i].id
  text += `-------------------<br />post #${id}<br />${getPostTextById(id)}<br /><br />`
  pool.query("INSERT INTO `POST`(`Title`, `Text`) VALUES ('" + 'sepezho.log backup post id:' + id + "', '" + getPostTextById(id).replace(/["']/g, "") + "');", (_, resultsCom) => {
    console.log('err:')
    console.log(_)
    console.log('res:')
    console.log(resultsCom)
  })
  i++;
}
fs.writeFileSync('./result_parsed.md', text)
// todo
 //  'bot_command',
 //  'email',
 //  'spoiler',
 //  'custom_emoji'
