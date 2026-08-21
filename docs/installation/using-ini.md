# Using tradernet.ini

```ini
[auth]
public   = YOUR_PUBLIC_KEY
private  = YOUR_PRIVATE_KEY
login    = user@example.com
password = secret
domain   = https://tradernet.com
auth_mode = sid_lazy
```

```ts
import { Tradernet } from 'tradernet-sdk';

const tn = await Tradernet.fromIni('./tradernet.ini').init();
```

Compatible with the Python and PHP SDK INI layout.
