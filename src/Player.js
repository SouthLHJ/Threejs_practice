import {
  Mesh,
  BoxGeometry,
  MeshBasicMaterial,
  // DoubleSide,
} from "three";

import { Vec3, Box, Body, Quaternion } from "cannon-es";

export class Player {
  constructor(info) {
    this.name = info.name;
    this.width = info.width || 1;
    this.height = info.height || 1;
    this.depth = info.depth || 1;
    this.color = info.color || "white";

    this.x = info.x || 0;
    this.y = info.y || this.height / 2;
    this.z = info.z || 0;
    this.rotationX = info.rotationX || 0;
    this.rotationY = info.rotationY || 0;
    this.rotationZ = info.rotationZ || 0;

    this.mass = info.mass || 0;
    this.cannonMaterial = info.cannonMaterial;
    this.cannonWorld = info.cannonWorld;

    if (info.modelSrc) {
      // GLB
      /*
            .load('사용될 3d모델 경로', 로드 성공시 호출 함수 , 로딩이 진행 중일 때 호출되는 함수, 에러가 났을 때 호출되는 함수)
      */
      info.loader.load(
        info.modelSrc,
        (glb) => {
          glb.scene.traverse((child) => {
            if (child.isMesh) {
              // child.receiveShadow = true;
              child.castShadow = true;
            }
          });
          this.mesh = glb.scene;

          info.scene.add(this.mesh);

          // glb.scene.position.set(this.x, this.y, this.z);
          this.mesh.position.set(this.x, this.y, this.z);
          this.mesh.rotation.set(
            this.rotationX,
            this.rotationY,
            this.rotationZ
          );
          this.setCannonBody();
        },
        (xhr) => {
          // console.log('loading...', xhr)
        },
        function (error) {
          console.error("error ", error);
        }
      );
    } else {
      // Primitives
      const geometry = new BoxGeometry(this.width, this.height, this.depth);
      const material = new MeshBasicMaterial({
        color: this.color,
        // side : DoubleSide
      });
      this.mesh = new Mesh(geometry, material);
      this.mesh.position.set(this.x, this.y, this.z);
      this.mesh.rotation.set(this.rotationX, this.rotationY, this.rotationZ);
      /*
        mesh가 receive,cast Shadow 일 때
        material이 DoubleSide로 표현될 경우, 
        그림자 표현이 거칠게 표현이 된다. 고로, doubleside를 포기해야한다.
        */
      this.mesh.receiveShadow = true;
      this.mesh.castShadow = true;
      info.scene.add(this.mesh);

      this.setCannonBody();
    }
  }

  setCannonBody() {
    this.cannonBody = new Body({
      mass: this.mass, // 객체의 물리 질량, mass가 0인 객체는 정지 상태를 유지하며 다른 물체에 의해 움직이지 않는다.
      position: new Vec3(this.x, this.y, this.z),
      shape: new Box(new Vec3(this.width / 2, this.height / 2, this.depth / 2)), // Box는 3D 상자 모양의 물리 객체를 나타낸다. 박스의 중심위치인 x,y,z에서 각 표면까지의 거리로 설정
      material: this.cannonMaterial,
    });

    // rotation : x
    const quatX = new Quaternion();
    const axisX = new Vec3(1, 0, 0);
    quatX.setFromAxisAngle(axisX, this.rotationX);
    // rotation : y
    const quatY = new Quaternion();
    const axisY = new Vec3(0, 1, 0);
    quatY.setFromAxisAngle(axisY, this.rotationY);
    // rotation : z
    const quatZ = new Quaternion();
    const axisZ = new Vec3(0, 0, 1);
    quatZ.setFromAxisAngle(axisZ, this.rotationZ);

    const combinedQuat = quatX.mult(quatY).mult(quatZ);
    this.cannonBody.quaternion = combinedQuat;

    this.cannonWorld.addBody(this.cannonBody);
  }

  walk(value, direction){
    console.log(value, direction)
  }
}
