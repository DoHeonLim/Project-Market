/**
File Name : components/comment-form
Description : 댓글 폼
Author : 임도헌

History
Date        Author   Status    Description
2024.11.06  임도헌   Created
2024.11.06  임도헌   Modified  댓글 폼 추가
2024.11.06  임도헌   Modified  useOptimistic기능으로 댓글 추가 구현

*/
"use client";

import { useFormState } from "react-dom";
import Input from "./input";
import { createComment } from "@/app/posts/[id]/actions";
import Button from "./button";
import { useRef } from "react";
import { ICommentsProps } from "./comment";

export default function CommentForm({
  postId,
  addOptimisticComment,
  user,
}: {
  postId: number;
  addOptimisticComment: (comment: ICommentsProps) => void;
  user: {
    id: number;
    username: string;
    avatar: string | null;
  };
}) {
  const formRef = useRef<HTMLFormElement>(null);
  const handleSubmit = async (formData: FormData) => {
    // useOptimistic을 사용하기 위한 임시 댓글
    const optimisticComment = {
      id: Math.random(),
      created_at: new Date(),
      userId: user.id,
      user: {
        username: user.username,
        avatar: user.avatar,
      },
      payload: formData.get("payload") as string,
    };

    // 낙관적 업데이트로 댓글 임시로 추가
    addOptimisticComment(optimisticComment);

    formData.set("postId", String(postId));
    alert("댓글을 등록했습니다.");
    // 폼 제출 후 초기화
    formRef.current?.reset();
    return action(formData);
  };
  const [state, action] = useFormState(createComment, null);
  return (
    <>
      <form ref={formRef} action={handleSubmit} className="mt-4 gap-2">
        <input type="hidden" name="postId" defaultValue={postId} />
        <div className="flex flex-row justify-around mx-auto text-black">
          <Input
            name="payload"
            type="text"
            required
            placeholder="댓글추가"
            errors={state?.fieldErrors.payload}
            className="w-full sm:w-[400px] md:w-[500px]"
          />
          <div className="w-20">
            <Button text="댓글 추가" />
          </div>
        </div>
      </form>
    </>
  );
}
