export class User {
    id: number;
	name:string;
    username: string;
	email: string;
    password: string;
    token?: string;
	perfil:{id:number, nombre:string};
}