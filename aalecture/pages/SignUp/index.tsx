import useInput from '@hooks/useInput';
import React, { useCallback, useState } from 'react';
import axios from 'axios';
import { Form, Error, Label, Input, LinkContainer, Button, Header, Success } from './styles';
import { Link, Redirect } from 'react-router-dom';
import useSWR from 'swr';
import fetcher from '@utils/fetcher';

const SignUp = () => {
  const { data, error, revalidate, mutate } = useSWR('http://localhost:3095/api/users', fetcher);
  const [email, onchangeEmail] = useInput('');
  const [nickname, onChangeNickname] = useInput('');
  const [password, , setPassword] = useInput('');
  const [passwordCheck, , setPasswordCheck] = useInput('');
  const [mismatchError, setMismatchError] = useState(false);
  const [signUpError, setSignUpError] = useState('');
  const [signUpSuccess, setSignUpSuccess] = useState(false);

  // revalidate : 서버로 다시 요청해서 데이터를 가져오는 역할
  // mutate : 서버로 데이터 안 보내고 수정하는 역할

  const onChangePassword = useCallback(
    (e) => {
      setPassword(e.target.value);
      setMismatchError(e.target.value !== passwordCheck);
    },
    [passwordCheck],
  );

  const onChangePasswordCheck = useCallback(
    (e) => {
      setPasswordCheck(e.target.value);
      setMismatchError(e.target.value !== password);
    },
    [password],
  );

  const onSubmit = useCallback(
    (e) => {
      e.preventDefault();
      console.log(email, nickname, password, passwordCheck);
      if (!mismatchError) {
        console.log('서버로 회원가입하기');
        // 요청 보내기 전 State 초기화
        setSignUpError('');
        setSignUpSuccess(false);
        axios
          .post('/api/users', {
            // 3095가 3095한테 보내는 것 (Back -> Back으로 설정)
            email,
            nickname,
            password,
          })
          .then((response) => {
            console.log(response);
            setSignUpSuccess(true);
          })
          .catch((error) => {
            console.log(error.response);
            setSignUpError(error.response.data);
          })
          .finally(() => {});
      }
    },
    [email, nickname, password, passwordCheck, mismatchError],
  );

  // 깜빡임 제거(로딩중 처리)
  if (data === undefined) {
    return <div> 로딩중... </div>;
  }

  if (data) {
    return <Redirect to="/workspace/channel" />; // return은 항상 hooks 보다 아래
  }

  return (
    <div id="container">
      <Header>Sleact</Header>
      <Form onSubmit={onSubmit}>
        <Label id="email-label">
          <span>이메일 주소</span>
          <div>
            <Input type="email" id="email" name="email" value={email} onChange={onchangeEmail} />
          </div>
        </Label>
        <Label id="nickname-label">
          <span>닉네임</span>
          <div>
            <Input type="text" id="nickname" name="nickname" value={nickname} onChange={onChangeNickname} />
          </div>
        </Label>
        <Label id="password-label">
          <span>비밀번호</span>
          <div>
            <Input type="password" id="password" name="password" value={password} onChange={onChangePassword} />
          </div>
        </Label>
        <Label id="password-check-label">
          <span>비밀번호 확인</span>
          <div>
            <Input
              type="password"
              id="password-check"
              name="password-check"
              value={passwordCheck}
              onChange={onChangePasswordCheck}
            />
          </div>
          {mismatchError && <Error>비밀번호가 일치하지 않습니다.</Error>}
          {!nickname && <Error>닉네임을 입력해주세요.</Error>}
          {signUpError && <Error>{signUpError}</Error>}
          {signUpSuccess && <Success>회원가입되었습니다! 로그인해주세요.</Success>}
        </Label>
        <Button type="submit">회원가입</Button>
      </Form>
      <LinkContainer>
        이미 회원이신가요?&nbsp;
        <Link to="/login">로그인 하러가기</Link>
      </LinkContainer>
    </div>
  );
};

export default SignUp;
