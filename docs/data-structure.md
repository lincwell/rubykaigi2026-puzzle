# Ruby メソッドチェーン最大化パズル

## 概要

文字列 `"Lincwell"` を起点に、指定されたメソッド群を **各1回まで** 使ってメソッドチェーンを作り、**最終的に得られる Integer の最大値** を求めるパズル。

Ruby のオブジェクトモデル、型遷移、`methods` の膨張、`to_s` / `inspect` / `bytes` / `sum` の性質を利用して値を最大化する。

---

## 前提環境

- Ruby **4.0 系**
- 検証時は以下を推奨

```bash
ruby --disable-gems
```

> `methods` を含むため、実行環境差分の影響を受ける可能性がある。  
> また、Ruby 4.0 系では将来の仕様変更により結果が変わる可能性がある。

---

## 問題

開始値を `"Lincwell"` とし、以下のメソッドを **各1回まで** 用いてメソッドチェーンを作る。

```ruby
chars, bytes, methods, class, to_s, inspect, join, size, length, sum
```

このとき、**得られる出力の最大値** を求める。

---

## ルール

- 開始値は必ず `"Lincwell"`
- 使用可能メソッドは以下の10個のみ

```ruby
chars
bytes
methods
class
to_s
inspect
join
size
length
sum
```

- 各メソッドは **0回または1回**
- 使用順は自由
- 全メソッドを使う必要はない
- 呼べないメソッドを呼んだチェーンは無効
- 例外が発生するチェーンは無効
- 最終結果が `Integer` のものだけを比較対象とする
- 最大の `Integer` を返すチェーンを正解とする

---

## 重要注意

### 1. `methods` を含むため環境依存

`methods` の返り値は以下で変化しうる。

- Ruby 4.0.x のパッチ差分
- `--disable-gems` の有無
- `irb` / 通常実行の違い
- `require` 済みライブラリ
- monkey patch の有無

したがって、**`methods` を含む式の値は環境依存**。

### 2. `String#sum` と `Array#sum` は別物

- `Array#sum`  
  → 要素の合計
- `String#sum`  
  → 文字列のチェックサム的な値

つまり、

```ruby
"abc".sum
```

と

```ruby
"abc".bytes.sum
```

は意味が異なる。

**byte の総和を取りたい場合は `bytes.sum` を使う。**

---

## 目的関数

比較対象は **最終結果が Integer のチェーン**。

最大化したい値:

```ruby
result.is_a?(Integer)
```

を満たすチェーンの `result` の最大値。

---

## 型遷移

主要メソッドの返り値は以下。

| メソッド | 主な返り値 |
|---|---|
| `chars` | `Array<String>` |
| `bytes` | `Array<Integer>` |
| `methods` | `Array<Symbol>` |
| `class` | `Class` |
| `to_s` | `String` |
| `inspect` | `String` |
| `join` | `String` |
| `size` | `Integer` |
| `length` | `Integer` |
| `sum` | `Integer` |

---

## 判定フロー

### 1. 開始
開始オブジェクトは以下。

```ruby
"Lincwell"
```

### 2. 未使用メソッドから1つ選ぶ
残っているメソッド群から1つ選択する。

### 3. 呼び出し可能性を判定
以下を満たすか確認する。

```ruby
obj.respond_to?(method_name)
```

- `false` ならその分岐は無効

### 4. 実行
以下で呼び出す。

```ruby
obj.public_send(method_name)
```

- 例外が出たらその分岐は無効

### 5. Integer なら候補記録
結果が `Integer` なら、その値を候補として保存する。

### 6. 続行判定
未使用メソッドが残っていれば、さらにチェーンを続けてよい。

### 7. 全探索
すべての有効なメソッド順を探索し、最大値を採用する。

---

## 探索イメージ

例1:

```ruby
"Lincwell"
  .chars
  .methods
  .to_s
  .inspect
  .bytes
  .sum
```

例2:

```ruby
"Lincwell"
  .size
  .methods
  .join
  .bytes
  .to_s
  .sum
```

---

## 攻略の基本方針

### 方針1: `methods` で膨らませる
`methods` は大量のメソッド名を含む配列を返すため、後続の `to_s` / `inspect` / `bytes` / `sum` と相性が良い。

### 方針2: `to_s` / `inspect` で文字列表現を肥大化
文字列化することで、`[]`, `:`, `,`, `" "` などの文字が加わり、長さや byte 総和が増えやすい。

### 方針3: `bytes` にしてから `sum`
文字列を `bytes` で整数配列にし、`Array#sum` で回収すると大きな値になりやすい。

### 方針4: `String#sum` を過信しない
`String#sum` は単純な byte 総和ではない。大きな値を安定して狙うなら `bytes.sum` が基本。

---

## 典型パターン

### 初級
```ruby
"Lincwell".size
"Lincwell".length
"Lincwell".methods.size
"Lincwell".chars.methods.size
```

### 中級
```ruby
"Lincwell".methods.join.size
"Lincwell".methods.to_s.size
"Lincwell".chars.to_s.bytes.sum
"Lincwell".class.methods.join.chars.to_s.size
```

### 上級
```ruby
"Lincwell".methods.join.sum
"Lincwell".methods.to_s.sum
"Lincwell".chars.join.methods.to_s.inspect.sum
"Lincwell".size.methods.join.bytes.to_s.sum
```

### 最上級
```ruby
"Lincwell".chars.size.methods.join.bytes.sum
"Lincwell".chars.methods.join.bytes.sum
"Lincwell".chars.methods.to_s.inspect.bytes.sum
"Lincwell".methods.to_s.chars.inspect.bytes.sum
```

> 以上の数値は `methods` の影響で環境依存。  
> Ruby 4.0 系では実際の最大値は探索で確定すること。

---

## トラップ

### 1. `size` と `length`
多くのオブジェクトで同じ値になる。

```ruby
"Lincwell".size == "Lincwell".length
```

```ruby
"Lincwell".methods.size == "Lincwell".methods.length
```

### 2. `Array#to_s` と `Array#inspect`
配列では同じ文字列表現になるケースがある。

```ruby
"Lincwell".methods.to_s == "Lincwell".methods.inspect
```

このため、以下も一致しやすい。

```ruby
"Lincwell".methods.to_s.size == "Lincwell".methods.inspect.size
"Lincwell".methods.to_s.sum  == "Lincwell".methods.inspect.sum
```

### 3. `String#sum` は byte 総和ではない
以下は別物。

```ruby
"abc".sum
"abc".bytes.sum
```

---

## 判定アルゴリズム

### 要件
- 深さ優先探索で全チェーンを列挙
- 各メソッドは1回まで
- `Integer` が出たタイミングで候補更新
- 最大値とチェーンを保持

### 参照実装

```ruby
METHODS = %i[
  chars
  bytes
  methods
  class
  to_s
  inspect
  join
  size
  length
  sum
]

best_value = -Float::INFINITY
best_chain = nil

dfs = lambda do |obj, rest, chain|
  if obj.is_a?(Integer) && obj > best_value
    best_value = obj
    best_chain = chain.dup
  end

  rest.each do |m|
    next unless obj.respond_to?(m)

    begin
      nxt = obj.public_send(m)
    rescue StandardError
      next
    end

    dfs.call(nxt, rest - [m], chain + [m])
  end
end

dfs.call("Lincwell", METHODS, [])

puts "best_value = #{best_value}"
puts "best_chain = " + ['"Lincwell"', *best_chain.map { |m| ".#{m}" }].join
```

---

## 実行方法

```bash
ruby --disable-gems solver.rb
```

---

## 入出力の考え方

### 入力
固定:

```ruby
"Lincwell"
```

### 出力
以下を返せればよい。

- 最大値
- その値を出すメソッドチェーン

例:

```ruby
value = 123456
expr  = '"Lincwell".chars.methods.to_s.inspect.bytes.sum'
```

---

## 採点観点

### 正解
- ルール内で有効
- 最終結果が `Integer`
- 最大値を達成している

### 部分点
- 有効な高得点チェーンを提示している
- ただし最大ではない

### 不正解
- 同一メソッドを2回以上使う
- 呼べないメソッドを呼ぶ
- 例外が発生する
- 最終結果が `Integer` でない

---

## ひとことで言うと

基本戦略は以下。

```text
methods で膨らませる
→ to_s / inspect で文字列化する
→ bytes で整数配列化する
→ sum で回収する
```

---

## 補足

この問題は単なる文字数比較ではなく、以下を使う探索問題。

- 型の分岐
- オブジェクトのメソッド集合
- 文字列表現の差
- byte 列化
- 合計値の回収

Ruby らしいメタプログラミング的性質がそのままパズルになっている。
