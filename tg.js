const fs = require("fs");
const pool = require("../src/utilities/mysql.js").pool;
const json = JSON.parse(fs.readFileSync('./result.json'))

const getPostTextById = async (id) => new Promise((res, rej) => {
  const post = json.messages.filter(e => e.id === id)[0]

  console.log('------------')
  console.log('New post, post id:', id)
  const postText = post.file + '#' + post.thumbnail + '#' + post.photo + '#' + post.date + '#' + post.text_entities.reduce((previous, current) => {
    if (current.type === 'italic') {
      current.text = `<i>${current.text}</i>`
    }
    if (current.type === 'bold') {
      current.text = `<b>${current.text}</b>`
    }
    if (current.type === 'link') {
      current.text = `<a href='${current.text}'>${current.text}</a>`
    }
    if (current.type === 'text_link') {
      console.log(current.href
      )
      current.text = `<a href='${current.href}'>${current.text}</a>`
    }
    if (current.type === 'mention') {
      current.text = `<a href='https://${current.text.slice(1)}.t.me'>${current.text}</a>`
    }
    if (current.type === 'strikethrough') {
      current.text = `<del>${current.text}</del>`
    }
    if (current.type === 'underline') {
      current.text = `<ins>${current.text}</ins>`
    }
    if (current.type === 'code') {
      current.text = `<code>${current.text}</code>`
    }
    return previous + current.text // todo add different text types support
  }, '')

  pool.query("INSERT INTO `POST`(`Title`, `Text`) VALUES ('" + 'sepezho.log backup post id:' + id + "', '" + postText.replace(/["']/g, "") + "');", (_, resultsCom) => {
    console.log(id)
    console.log(_, resultsCom
    )
    res(true)
  })
})

const ad = async () => {
  const ln = json.messages.length;
  let i = 0
  while (i < ln) {
    const id = json.messages[i].id
    // text += `-------------------<br />post #${id}<br />${getPostTextById(id)}<br /><br />`
    await getPostTextById(id)
    i++;
  }
}
ad()
// todo
 //  'bot_command',
 //  'email',
 //  'spoiler',
 //  'custom_emoji'
  // console.log(new Set(json.messages.map(e => e.text_entities).reduce((previous, current) => {
  //   return [...previous, ...current.map(e => e.type)]
  // }, []))
  // )
