import useInput from '@hooks/useInput';
import { Success, Form, Error, Label, Input, LinkContainer, Button, Header } from '@pages/SignUp/styles';
import fetcher from '@utils/fetcher';
import axios from 'axios';
import React, { useCallback, useState } from 'react';
import { Link, Redirect } from 'react-router-dom';
import useSWR from 'swr';

const LogIn = () => {
  const { data, error, revalidate, mutate } = useSWR('http://localhost:3095/api/users', fetcher); // data가 존재하지 않으면 Loading
  const [logInError, setLogInError] = useState(false);
  const [email, onChangeEmail] = useInput('');
  const [password, onChangePassword] = useInput('');

  // revalidate : 서버로 다시 요청해서 데이터를 가져오는 역할
  // mutate : 서버로 데이터 안 보내고 수정하는 역할

  const onSubmit = useCallback(
    (e) => {
      e.preventDefault();
      setLogInError(false);
      axios
        .post(
          'http://localhost:3095/api/users/login', // Front에서 Proxy를 안 쓰고 CORS를 Back에서 처리해주었을 떄
          { email, password },
          {
            withCredentials: true,
          },
        )
        .then((response) => {
          // revalidate();
          // response.data => 기존에 가지고 있던 data가 존재하며 변동이 없을 때, 불필요하게 요청 보내지 않도록 mutate 활용
          // mutate - shouldRevalidate : true일 경우(Optimistic UI), action이 있을 때마다 서버에서 검사, false일 경우, front에서 action 바로 처리하고 추후 서버로 한꺼번에 처리
          mutate(response.data, false);
        })
        .catch((error) => {
          setLogInError(error.response?.data?.statusCode === 401);
        });
    },
    [email, password],
  );

  // 깜빡임 제거(로딩중 처리)
  if (data === undefined) {
    return <div> 로딩중... </div>;
  }

  if (data) {
    return <Redirect to="/workspace/channel" />;
  }

  // console.log(error, userData);
  // if (!error && userData) {
  //   console.log('로그인됨', userData);
  //   return <Redirect to="/workspace/sleact/channel/일반" />;
  // }

  return (
    <div id="container">
      <Header>Sleact</Header>
      <Form onSubmit={onSubmit}>
        <Label id="email-label">
          <span>이메일 주소</span>
          <div>
            <Input type="email" id="email" name="email" value={email} onChange={onChangeEmail} />
          </div>
        </Label>
        <Label id="password-label">
          <span>비밀번호</span>
          <div>
            <Input type="password" id="password" name="password" value={password} onChange={onChangePassword} />
          </div>
          {logInError && <Error>이메일과 비밀번호 조합이 일치하지 않습니다.</Error>}
        </Label>
        <Button type="submit">로그인</Button>
      </Form>
      <LinkContainer>
        아직 회원이 아니신가요?&nbsp;
        <Link to="/signup">회원가입 하러가기</Link>
      </LinkContainer>
    </div>
  );
};

export default LogIn;
