/**
File Name : lib/db
Description : 프리즈마 클라이언트
Author : 임도헌

History
Date        Author   Status    Description
2024.10.06  임도헌   Created
2024.10.06  임도헌   Modified  프리즈마 클라이언트 생성
*/
import { PrismaClient } from "@prisma/client";

const db = new PrismaClient();

export default db;
