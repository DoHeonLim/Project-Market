/**
 File Name : app/streams/add/page
 Description : 라이브 스트리밍 추가 페이지
 Author : 임도헌
 
 History
 Date        Author   Status    Description
 2024.11.12  임도헌   Created
 2024.11.12  임도헌   Modified  라이브 스트리밍 추가 페이지
 */
"use client";

import Button from "@/components/button";
import Input from "@/components/input";
import { useFormState } from "react-dom";
import { startStream } from "./actions";

export default function AddStream() {
  const [state, action] = useFormState(startStream, null);
  return (
    <form action={action} className="p-5 flex flex-col gap-2">
      <Input
        errors={state?.formErrors}
        name="title"
        required
        placeholder="스트리밍 제목"
      />
      <Button text="스트리밍 시작" />
    </form>
  );
}
