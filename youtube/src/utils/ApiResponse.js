export class ApiResponse extends Response {
    constructor(statusCode,data,message="",success){
        super(message)
        this.statusCode=statusCode,
        this.data=data,
        this.message=message,
        this.success=statusCode<400
    }
}