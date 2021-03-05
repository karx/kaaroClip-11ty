AFRAME.registerComponent('thumbstick-goto',{
    init: function () {
      this.el.addEventListener('thumbstickdown', this.gotoEntity);
    },
    gotoEntity: function (evt) {
        console.log('THUMBSTICK down')
      console.log(this.el.intersectedEls);
      if(this.el.intersectedEls > 0) {
          let topEl = this.el.intersectedEls[0];
          let newPos = `${topEl.object3D.position.x} ${topEl.object3D.position.y} ${topEl.object3D.position.z + 3}`;
          new rot = `0 0 0`;

          document.getElementById('rig').setAttribute('animation', `property: position; to: ${newPos}; dur: 2000;`)
      }
      console.log(evt);
    }
  });