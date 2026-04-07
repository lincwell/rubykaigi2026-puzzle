# frozen_string_literal: true

START = "Lincwell"
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
].freeze

THRESHOLDS = [
  100,
  1_000,
  10_000,
  50_000,
  100_000,
  500_000
].freeze

Result = Struct.new(:chain, :value)

def chain_to_code(chain)
  expr = START.dump
  chain.each { |m| expr << ".#{m}" }
  expr
end

def explore(obj, unused_methods, chain, results_by_chain)
  if obj.is_a?(Integer)
    key = chain.dup
    results_by_chain[key] ||= Result.new(chain.dup, obj)
  end

  unused_methods.each_with_index do |method_name, i|
    begin
      next unless obj.respond_to?(method_name)
      next_obj = obj.public_send(method_name)
    rescue StandardError
      next
    end

    next_unused = unused_methods[0...i] + unused_methods[(i + 1)..]
    chain << method_name
    explore(next_obj, next_unused, chain, results_by_chain)
    chain.pop
  end
end

def sort_results(results)
  results.sort_by { |r| [r.value, r.chain.length, r.chain.join(".")] }
end

def print_results(title, results, limit: nil)
  puts title
  puts "-" * title.size

  target = limit ? results.first(limit) : results
  target.each do |r|
    puts "%10d  %s" % [r.value, chain_to_code(r.chain)]
  end

  if limit && results.size > limit
    puts "... (#{results.size - limit} more)"
  end

  puts
end

def range_label(lo, hi)
  if hi.infinite?
    "%10s -" % lo
  else
    "%10s - %s" % [lo, hi - 1]
  end
end

def print_range_counts_with_tail_samples(results, thresholds, sample_size: 3)
  edges = [0] + thresholds.sort.uniq + [Float::INFINITY]

  puts "range counts + tail samples"
  puts "---------------------------"

  edges.each_cons(2) do |lo, hi|
    bucket = results.select { |r| lo <= r.value && r.value < hi }
    label = range_label(lo, hi)

    puts "#{label} : #{bucket.size}"

    if bucket.empty?
      puts "  sample: (none)"
      puts
      next
    end

    tail = bucket.last(sample_size)
    puts "  sample: last #{tail.size} item(s) in this range"
    tail.each do |r|
      puts "    %10d  %s" % [r.value, chain_to_code(r.chain)]
    end
    puts
  end
end

def print_min_score_counts(results, thresholds)
  values = results.map(&:value)

  puts "minScore counts"
  puts "---------------"

  thresholds.sort.uniq.each do |min_score|
    count = values.count { |v| v >= min_score }
    puts "minScore: %10s  count: %d" % [min_score, count]
  end

  puts
end

results_by_chain = {}
explore(START, METHODS, [], results_by_chain)

# 1) メソッドチェーンがユニーク
results = sort_results(results_by_chain.values)

puts "valid unique chains: #{results.size}"
puts

if results.empty?
  puts "Integer になるチェーンは見つかりませんでした。"
  exit
end

print_results("unique chains by method-chain (ascending, first 30)", results, limit: 30)

# 2) 領域ごとの件数 + 末尾3件サンプル
print_range_counts_with_tail_samples(results, THRESHOLDS, sample_size: 3)

# 3) minScore以上の件数
print_min_score_counts(results, THRESHOLDS)

# 4) 同じ数値は1件だけ残す版
unique_by_value = {}
results.each do |r|
  unique_by_value[r.value] ||= r
end

value_unique_results = sort_results(unique_by_value.values)

puts "unique values only: #{value_unique_results.size}"
puts

print_results("unique by value (ascending, first 30)", value_unique_results, limit: 30)

puts "sample: first 3 unique values"
puts "-----------------------------"
value_unique_results.first(3).each do |r|
  puts "%10d  %s" % [r.value, chain_to_code(r.chain)]
end
puts

puts "sample: last 3 unique values"
puts "----------------------------"
value_unique_results.last(3).each do |r|
  puts "%10d  %s" % [r.value, chain_to_code(r.chain)]
end
puts

max_result = results.max_by(&:value)
puts "max value"
puts "---------"
puts "#{max_result.value}  #{chain_to_code(max_result.chain)}"
