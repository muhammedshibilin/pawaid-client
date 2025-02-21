export interface IDoctor{
    _id:number,
    username:string;
    email:string;
    phone:number;
    location: {
        latitude:number,
        longitude:number
    };
    is_block?:boolean;
    is_verified?:boolean;
    rescued?:number;
    is_available?:boolean;
    createdAt?:Date;
    updatedAt?:Date;

}