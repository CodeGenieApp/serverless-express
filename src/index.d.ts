import {RequestListener, Server as httpServer} from "http";
import {APIGatewayEvent, Context} from "aws-lambda";

declare namespace AWSServerLess {
    interface Server extends httpServer {
    }

    type Proxy = {
        response: {
            statusCode: number,
            body: string,
            headers: { [key: string]: string },
            isBase64Encoded: boolean
        }
    }
}

export declare function createServer(requestListener: RequestListener, serverListenCallback?: () => void, binaryTypes?: string[]): AWSServerLess.Server;

/** @deprecated Legacy support */
export declare function proxy(server: AWSServerLess.Server, event: APIGatewayEvent, context: Context): AWSServerLess.Server;
export declare function proxy(server: AWSServerLess.Server, event: APIGatewayEvent, context: Context, resolutionMode: "CONTEXT_SUCCEED" | "PROMISE"): { promise: Promise<AWSServerLess.Proxy> }
export declare function proxy(server: AWSServerLess.Server, event: APIGatewayEvent, context: Context, resolutionMode: "CALLBACK", callback: (error, response) => any): { promise: Promise<AWSServerLess.Proxy> };

