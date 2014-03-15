function Station() {
  this.operator = null;
  this.queue = []
  this.stats = {
    in:0,
    out:0,
    avg:0,
    speed:0,
  };
}

Station.prototype.enqueue = function() {
  this.stats.in += 1;
  this.queue.push(new Product(new Date().getTime()));
}

Station.prototype.dequeue = function() {
  if(this.queue.length > 0) {
    var product = this.queue.shift();
    var lifetime = product.lifetime();
    this.stats.out += 1;
    if(this.stats.out == 1) {
      this.stats.avg = parseFloat(Number(lifetime).toFixed(2));
    }
    else {
      this.stats.avg = parseFloat(Number((this.stats.avg + lifetime) / 2.0).toFixed(2));
    }
    if(this.stats.avg > 0) {
      this.stats.speed = parseFloat(Number(1.0 / this.stats.avg).toFixed(2));
    }
  }
}

function Product(start) {
  this.start = start;
  this.end = null;
}

// Returns product lifetime in minutes.
Product.prototype.lifetime = function() {
  this.end = new Date().getTime();
  var diff = this.end - this.start;
  return diff/1000.0/60.0;
}

module.exports = Station;
