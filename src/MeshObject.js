import {
    Mesh,
    BoxGeometry,
    MeshLambertMaterial,
    // DoubleSide,
} from 'three';

export class MeshObject {
    constructor(info){
        this.name = info.name;
        this.width = info.width || 1;
        this.height = info.height || 1;
        this.depth = info.depth || 1;
        this.color = info.color || 'white';

        this.x = info.x || 0;
        this.y = info.y || this.height /2 ;
        this.z = info.z || 0;
        this.rotationX = info.rotationX || 0;
        this.rotationY = info.rotationY || 0;
        this.rotationZ = info.rotationZ || 0;

        
        if( info.modelSrc){
            
            // GLB
            /*
                .load('사용될 3d모델 경로', 로드 성공시 호출 함수 , 로딩이 진행 중일 때 호출되는 함수, 에러가 났을 때 호출되는 함수)
            */
            info.loader.load( info.modelSrc, function ( glb ) {
                glb.scene.traverse(child =>{
                    if(child.isMesh){
                        // child.receiveShadow = true;
                        child.castShadow = true;
                    }
                })
                info.scene.add( glb.scene );

                // glb.scene.position.set(this.x, this.y, this.z);
                glb.scene.position.set(info.x || 0, info.y || 0, info.z || 0);
                glb.scene.rotation.set(info.rotationX || 0, info.rotationY || 0, info.rotationZ || 0)
            }, xhr => {
                // console.log('loading...', xhr)
            } , function ( error ) {
                console.error( 'error ', error );
            } );
        }
        else if ( info.mapSrc){
            const geometry = new BoxGeometry(this.width, this.height, this.depth);
            info.loader.load(
                info.mapSrc,
                texture=>{
                    const material = new MeshLambertMaterial({
                        map : texture
                    })
                    this.mesh = new Mesh(geometry, material);
                    this.mesh.position.set(this.x, this.y, this.z);
                    this.mesh.rotation.set(this.rotationX, this.rotationY, this.rotationZ)
                    this.mesh.receiveShadow = true;
                    this.mesh.castShadow = true;
                    info.scene.add(this.mesh);
                }
            )
        }
        else{
            // Primitives
            const geometry = new BoxGeometry(this.width, this.height, this.depth);
            const material =  new MeshLambertMaterial({
                color : this.color,
                // side : DoubleSide
            })
            this.mesh = new Mesh(geometry, material);
            this.mesh.position.set(this.x, this.y, this.z);
            this.mesh.rotation.set(this.rotationX, this.rotationY, this.rotationZ)
            /*
                mesh가 receive,cast Shadow 일 때
                material이 DoubleSide로 표현될 경우, 
                그림자 표현이 거칠게 표현이 된다. 고로, doubleside를 포기해야한다.
             */
            this.mesh.receiveShadow = true;
            this.mesh.castShadow = true;
            info.scene.add(this.mesh);
        }

            

    }
}