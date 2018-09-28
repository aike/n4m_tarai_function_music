/*
 * tarailanguage.js
 *
 * This program is licensed under the MIT License.
 * Copyright 2018, aike (@aike1000)
 *
 */

const Player = require('./player');

class Stack {
  constructor() {
    this.data = [];
  }
  push(val) {
    this.data.push(val);
    return val;
  }
  pop() {
    return this.data.pop();
  }
  empty() {
    return this.data.length === 0;
  }
}

///////////

class TaraiLanguage {
  constructor() {
    this.pc = null;
    this.clock = null;
    this.stack = null;
    this.jumptable = {};
    this.vars = null;
    this.count = 0;
    this.running = false;
    this.pause = false;
    this.reset = false;
    this.script = null;
    this.wait = 1800;
    this.player = new Player();
  }

  run(script) {
    this.script = script;
    this.initJumptable();
    this.initEnvironment();
    this.reset = false;
    this.running = true;
    setTimeout(() => {this.eval();}, this.clock);
  }

  initJumptable() {
    for (let i = 0; i < this.script.length; i++) {
      const a = this.script[i].split(' ');
      if (a[0] === 'def') {
        this.jumptable[a[1]] = i;
      }
    }
  }

  initEnvironment() {
    this.pc = 0;
    this.clock = 0;
    this.stack = new Stack();
    this.vars = {};
    this.count = 0;
    this.running = false;
    this.pause = false;

    this.vars['a1'] = 0;
    this.vars['a2'] = 0;
    this.vars['a3'] = 0;
    this.vars['ret'] = 0;
    this.vars['v1'] = 0;
    this.vars['v2'] = 0;
    this.vars['v3'] = 0;
    this.vars['v4'] = 0;
  }

  evalvar(atom) {
    return (atom.match(/^-?[0-9]+$/)) ? parseInt(atom, 10) : parseInt(this.vars[atom], 10);
  }

  sleep(millisec) {
    this.clock = millisec;
  }

  print(text) {
    console.log(text);
  }

  eval() {
    // pause
    if (this.pause) {
      setTimeout(() => {this.eval();}, 100);
      return;
    }

    // terminate program
    if (this.reset || (this.script[this.pc] === null) || (this.script[this.pc] === 'end')) {
      this.running = false;
      if (this.reset) {
        this.reset = false;
        this.initEnvironment();
      }
      return;
    }

    // split command line
    const args = this.script[this.pc].replace(/^[   ]+/, '').replace(/#.*/, '').split(/[  ]+/);
    let cmd = args[0];
    if (args[1] === '=') {
      cmd = args[1];
    }
    if (args.length == 1) {
      cmd = 'blank';
    }

    var w1, w2, w3;

    this.clock = 0;
    switch (cmd) {
      case 'blank':
        this.pc += 1;
        break;

      case 'sleep':
        this.sleep(this.evalvar(args[1]));
        this.pc += 1;
        break;

      case 'play':
        this.sleep(this.wait * 990 / 1000); // latency adjustment (99%)
        this.pc += 1;
        this.player.play(
          this.evalvar(args[1]),
          this.evalvar(args[2]),
          this.evalvar(args[3]));
        break;

      case 'print':
        if (args[1].match(/^".*"$/)) {
          this.print(args[1].replace(/^"/, '').replace(/"$/, ''));
        } else {
          this.print(this.evalvar(args[1]));
        }
        this.pc += 1;
        break;

      case '=':
        if (args.length > 4) {
          w1 = this.evalvar(args[2]);
          w2 = this.evalvar(args[4]);
          switch (args[3]) {
            case '+':
              this.vars[args[0]] = w1 + w2;
              break;
            case '-':
              this.vars[args[0]] = w1 - w2;
              break;
            case '*':
              this.vars[args[0]] = w1 * w2;
              break;
            case '/':
              this.vars[args[0]] = Math.floor(w1 / w2);
              break;
            default:
              console.log('error (' + this.pc + '): ' + this.script[this.pc]);
              this.reset = true;
          }
        } else {
          this.vars[args[0]] = this.evalvar(args[2]);
        }
        this.pc += 1;
        break;

      case 'if':
        w1 = this.evalvar(args[1]);
        w2 = this.evalvar(args[3]);
        if (((args[2] === '==') && (w1 === w2))
         || ((args[2] === '!=') && (w1 != w2))
         || ((args[2] === '<=') && (w1 <= w2))
         || ((args[2] === '>=') && (w1 >= w2))
         || ((args[2] === '<')  && (w1 <  w2))
         || ((args[2] === '>')  && (w1 >  w2))) {
          this.pc += 1;
        } else {
          this.pc += 2;
        }
        break;

      case 'def':
        this.pc += 1;
        break;

      case 'defend':
        this.pc += 1;
        break;

      case 'call':
        // save variables
        this.stack.push(this.vars['v1']);
        this.stack.push(this.vars['v2']);
        this.stack.push(this.vars['v3']);
        this.stack.push(this.vars['v4']);
        this.stack.push(this.vars['a1']);
        this.stack.push(this.vars['a2']);
        this.stack.push(this.vars['a3']);

        // set arguments
        w1 = this.evalvar(args[2]);
        w2 = this.evalvar(args[3]);
        w3 = this.evalvar(args[4]);
        this.vars['a1'] = w1;
        this.vars['a2'] = w2;
        this.vars['a3'] = w3;

        // show arguments
        this.count += 1;
        // this.print('[' + this.count + '] (' + w1 + ',' + w2 + ',' + w3 + ')');

        // init local variables
        this.vars['ret'] = 0;
        this.vars['v1'] = 0;
        this.vars['v2'] = 0;
        this.vars['v3'] = 0;
        this.vars['v4'] = 0;

        // set return address
        this.stack.push(this.pc + 1);

        // jump to function's address
        this.pc = this.jumptable[args[1]];
        break;

      case 'return':
        // set return value
        this.stack.push(this.evalvar(args[1]));

        // get return value
        this.vars['ret'] = this.stack.pop();
        // pop return address
        this.pc = this.stack.pop();
        // pop variables
        this.vars['a3'] = this.stack.pop();
        this.vars['a2'] = this.stack.pop();
        this.vars['a1'] = this.stack.pop();
        this.vars['v4'] = this.stack.pop();
        this.vars['v3'] = this.stack.pop();
        this.vars['v2'] = this.stack.pop();
        this.vars['v1'] = this.stack.pop();
        break;

      default:
        console.log('error (' + this.pc + '): ' + this.script[this.pc]);
        this.reset = true;
    }

    setTimeout(() => {this.eval();}, this.clock);
  }

  onStart(script) {
    if (!this.running) {
      this.player.setMute(false);
      this.run(script);
    } else {
      this.pause = !this.pause;
      player.toggleMute();
    }
  }

  onReset() {
    this.reset = true;
    this.pause = false;
    this.initEnvironment();
    this.player.setMute(true);
  }
}

module.exports = TaraiLanguage;
