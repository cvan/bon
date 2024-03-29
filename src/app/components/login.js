import componentFactory from '../component-factory';
import routes from '../routes';

componentFactory.createComponent('login', `

<form onsubmit="{ login }">
    <div>
      <span class="login-field">
        User Name:
      </span>
      <span>
        <input type="text" name="username">
      </span>
    </div>
    <div>
      <span class="login-field">
        Password:
      </span>
      <span>
        <input type="password" name="password">
      </span>
    </div>
    <div>
      <span class="login-field">
        <input type="submit" value="Login">
      </span>
    </div>
</form>

<div if={errorMessage} class="login-error">
  {errorMessage}
</div>

<p class="note">* Default user/password: test/1234 * </p>

<style>
  login {
    color: black;
  }

  login .login-field {
    display: inline-block;
    margin: 5px;
    width: 100px;
  }

  login .note {
    font-size: 14px;
  }

  login .login-error {
    color: red;
    font-weight: bold;
  }

</style>

`, function (opts) {
  this.login = e => {
    console.log('Logging in with: ', this.username.value, '/', this.password.value);
    this.dispatcher.trigger('user_login', {
      username: this.username.value,
      password: this.password.value
    });
  };

  this.dispatcher.on('login_error', msg => {
    console.log('Received login error message: ', msg);
    this.errorMessage = msg;
    this.update();
  });

  this.dispatcher.on('login_success', () => {
    console.log('Logged in');
    routes.page.show('/');
  });
});
