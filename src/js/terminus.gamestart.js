// Initiate Game state - required to be called 'state'
// import { GameState, VTerm, _,  dom, _match, Seq, Context, pogencnt } from 'engine'
// import { snd, music } from 'terminus.assets'
// import { $home } from 'terminus.level1'
// import { doTest } from 'tests'
var state = new GameState() // GameState to initialize in game script
var vt = new VTerm('term')
window.addEventListener('load', Game)
function Game(){
  var t = Game.prototype
  t.version = '0.2beta'
  if (typeof doTest === 'function') {
    doTest(vt)
    return
  }
  console.log('new game')
  new Seq([t.demo_note,t.menu]).next()
}
Game.prototype = {
  demo_note(next) {
      vt.ask_choose(_('demo_note'), [_('demo_note_continue')],
        function (vt, choice) {
          vt.clear()
          next()
        },
        { direct: true, cls: 'mystory' }
      )
  },
  menu(next) {
      // prepare game loading
      var t = Game.prototype
      let hasSave = state.startCookie('terminus' + t.version)
      let choices = [_('cookie_yes_load'),_('cookie_yes'), _('cookie_no')]
      flash(0, 800)
      // TODO : add checkbox for snd and textspeed
      // TODO : opt object for setting vt option
      if (d(state._get_pre('snd'),true)){
        load_soundbank(vt)
      }
      vt.epic_img_enter('titlescreen.gif', 'epicfromright', 2000, function (vt) {
        vt.show_msg('version : ' + t.version)
        //        vt.playMusic('title',{loop:true});
        vt.ask_choose(_('cookie'), choices, t.start, {
          direct: true,
          disabled_choices: hasSave ? [] : [0]
        })
      })
  },
  start: function (vt, useCookies) {
    console.log('Start game')
    var context
    if (pogencnt > 0) vt.show_msg(_('pogen_alert', pogencnt))
    if (useCookies < 3) { // yes new game or load
      state.setCookieDuration(7 * 24 * 60) // in minutes
      if (useCookies < 2) context = state.loadContext()
    } else state.stopCookie() // do not use cookie
    vt.clear()
    if (context) {
      vt.setContext(context)
      state.loadActions()
      vt.unmuteSound()
      vt.notification(_('game_loaded'))
      vt.show_msg(vt.context.room.getStarterMsg(_('welcome_msg', vt.context.currentuser) + '\n'))
      vt.enable_input()
    } else {
      context = new Context({ 'sure': { groups: ['user'], address: 'DTC' } }, 'sure', $home, {})
      vt.setContext(context)
      vt.unmuteSound()
      vt.playMusic('preload')
      var loadel
      new Seq().then(function (next) {
        // vt.unmuteSound();
        vt.ask(_('prelude_text'), function (val) {
          if (_match('re_hate', val)) {
            vt.context.user.judged = _('user_judged_bad')
          } else if (_match('re_love', val)) {
            vt.context.user.judged = _('user_judged_lovely')
          } else {
            vt.context.user.judged = _('user_judged' + Math.min(5, Math.round(val.length / 20)))
          }
        },
        { cls: 'mystory', disappear: function (cb) { cb(); next() }
        }
        )
      })
        .then(function (next) {
          vt.ask(vt.context.user.judged + '\n' + _('username_prompt'), function (val) { vt.context.setUserName(val); next() }, { placeholder: vt.context.currentuser, cls: 'megaprompt', disappear: function (cb) { cb() }, wait: 500 })
        })
        .then(function (next) {
          vt.ask(_('useraddress_prompt'), function (val) { vt.context.setUserAddress(val); next() }, { placeholder: vt.context.user.address,
            cls: 'megaprompt',
            disappear: function (cb) {
              cb()
            },
            wait: 500 })
        })
        .then(function (next) {
          vt.ask(_('gameintro_setup_ok'), function (val) {
          },
          { value: '_ _ _ !',
            cls: 'mystory',
            evkey: {
              'ArrowUp': function () {
                vt.answer_input.value = '_ ↑ _ ?'
              },
              'ArrowLeft': function () {
                vt.answer_input.value = '← _ _ ?'
              },
              'ArrowRight': function () {
                vt.answer_input.value = '_ _ → ?'
              },
              'ArrowDown': function () {
                vt.answer_input.value = '_ ↓ _ ?'
              },
              'Tab': function () {
                vt.answer_input.value = '_ ↹ _ ?'
              }
            },
            disappear: function (cb) {
              cb()
              flash(0, 800)
              next()
            }
          }
          )
        })
        .then(function (next) {
          vt.show_loading_element_in_msg(['_', ' '], { duration: 800, finalvalue: ' ', callback: next })
        })
        .then(function (next) {
          vt.muteSound()
          vt.show_loading_element_in_msg(['_', ' '], { duration: 800, finalvalue: ' ', callback: next })
        })
        .then(function (next) {
          vt.show_msg(_('gameintro_text_initrd'), { cb: next })
        })
        .then(function (next) {
          loadel = dom.Id('initload')
          vt.show_loading_element_in_msg(['/\'', '\'-', ' ,', '- '], {
            el: loadel,
            finalvalue: "<span class='color-ok'>" + _('gameintro_ok') + '</span>',
            duration: 800,
            callback: next })
        })
        .then(function (next) {
          vt.show_msg(_('gameintro_text_domainname'), { cb: next })
        })
        .then(function (next) {
          loadel = dom.Id('domainsetup')
          vt.show_loading_element_in_msg(['/\'', '\'-', ' ,', '- '], {
            el: loadel,
            finalvalue: "<span class='color-ok'>" + _('gameintro_ok') + '</span>',
            duration: 800,
            callback: next })
        })
        .then(function (next) {
          vt.show_msg(_('gameintro_text_fsck'), { cb: next })
        })
        .then(function (next) {
          loadel = dom.Id('initfsck')
          vt.show_loading_element_in_msg(['/\'', '\'-', ' ,', '- '], {
            el: loadel,
            finalvalue: "<span class='color-ko'>" + _('gameintro_failure') + '</span>',
            duration: 800,
            callback: next })
        })
        .then(function (next) {
          vt.show_msg(_('gameintro_text_terminus'), { cb: next })
        })
        .then(function (next) {
          vt.show_msg(_('gamestart_text'))
          vt.unmuteSound()
          vt.playMusic('story')
          vt.enable_input()
          vt.auto_shuffle_line(_('press_enter'), 0.9, 0.1, 8, 20, null, 50)
        })
        .next()
    }
  }
}
/**
 * API:
 * CREATE ROOMS, ITEMS and PEOPLES
 *     <Room>=newRoom(id, img, props) set a new room variable named $id
 *     <Item>=<Room>.newItem(id, img)
 *     <People>=<Room>.newPeople(id, img)
 *     id : non 'room_' part of a key 'room_<id>' in GameDialogs file
 *              GameDialogs file shall contain :
 *               - room_<roomid> :      the name of the room
 *               - room_<roomid>_text : the description of what happening in
 *                                      the room
 *          non 'item_' (or 'people_') part of a key 'item_<id>' in GameDialogs file
 *              GameDialogs file shall contain :
 *               - item_<id>   :      the name of the item
 *              ( - people_<id> :      the name of the person )
 *               - item_<id>_text   : a description
 *              ( - people_<id>_text : a description )
 *     img : img file in image directory
 *
 *     props : hash without many optionnal properties like executable, readable, writable
 *
 *    Return the <Room> object and define $varname variable (='$'+id)
 *
 *    Note : $home is required , in order to define path '~/', and command 'cd'.
 *
 * CONNECT ROOMS
 *    <Room>.addPath(<Room>)
 *
 * FIRST PROMPT
 *    If the player start a game or load it from saved state,
 *    you can display a message for the room she/he starts.
 *    Default is the result of 'pwd'.
 *    <Room>.setStarterMsg(<welcome_message>);
 *
 * COMMANDS
 *    // alter result of the command
 *    <Room>.setCmdText(<cmd_name>,<cmd_result>)
 *    <Item>.setCmdText(<cmd_name>,<cmd_result>)
 *
 */
// All bash shortcuts : https://ss64.com/bash/syntax-keyboard.html
