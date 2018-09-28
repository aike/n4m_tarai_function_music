/*
 * player.js
 *
 * This program is licensed under the MIT License.
 * Copyright 2018, aike (@aike1000)
 *
 */

//////////////////////

const Max = require('max-api');

class Player {
  constructor() {
    this.beat = Math.floor(1800 / 16);
    this.notelen = Math.floor(this.beat * 4 * 7 / 8);
    this.mute = false;
    this.scale = {'-1':74, 0:76, 1:77, 2:79, 3:81, 4:83, 5:84, 6:86, 7:88, 8:89, 9:91, 10:93};

  }

  setTempo(tempo) {
    this.beat = Math.floor(tempo / 16);
    this.notelen = Math.floor(this.beat * 4 * 7 / 8);
  }

  setMute(flag) {
    this.mute = flag;
  }

  toggleMute() {
    this.mute = !this.mute;
  }

  playnote(note, timer) {
    setTimeout(() => {
      if (!this.mute) {
        Max.outlet(note);
      }
    }, timer);
  }

  play(n1, n2, n3) {
    var a = [this.scale[n1], this.scale[n2], this.scale[n3]]
          .sort(function(a,b){
            if( a < b ) return -1;
            if( a > b ) return 1;
            return 0;
          });
    this.playnote(a[0],      this.beat * 0);
    this.playnote(a[0] + 12, this.beat * 1);
    this.playnote(a[1],      this.beat * 2);
    this.playnote(a[1] + 12, this.beat * 3);
    this.playnote(a[2],      this.beat * 4);
    this.playnote(a[2] + 12, this.beat * 5);
    this.playnote(a[1],      this.beat * 6);
    this.playnote(a[1] + 12, this.beat * 7);

    this.playnote(a[0],      this.beat * 8);
    this.playnote(a[0] + 12, this.beat * 9);
    this.playnote(a[1],      this.beat * 10);
    this.playnote(a[1] + 12, this.beat * 11);
    this.playnote(a[2],      this.beat * 12);
    this.playnote(a[2] + 12, this.beat * 13);
    this.playnote(a[1],      this.beat * 14);
    this.playnote(a[1] + 12, this.beat * 15);
  }
}

module.exports = Player;

